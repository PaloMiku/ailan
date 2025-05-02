/**
 * -AI-
 * Bot的后端（负责思考）
 *
 * 如果对话和思考在同一个进程中进行，当思考时间过长时，
 * 可能会从流中断开，因此将它们放在不同的进程中处理。
 */

import got from 'got';
import * as Reversi from './engine.js';
import config from '@/config.js';
import serifs from '@/serifs.js';
import type { User } from '@/misskey/user.js';

function getUserName(user) {
	return user.name || user.username;
}

const titles = [
	'さん', 'サン', 'ｻﾝ', '㌠',
	'ちゃん', 'チャン', 'ﾁｬﾝ',
	'君', 'くん', 'クン', 'ｸﾝ',
	'先生', 'せんせい', 'センセイ', 'ｾﾝｾｲ'
];

class Session {
	private account: User;
	private game: any;
	private form: any;
	private engine: Reversi.Game;
	private botColor: Reversi.Color;

	private appliedOps: string[] = [];

	/**
	 * 角落附近的索引列表（用于静态评估）
	 */
	private sumiNearIndexes: number[] = [];

	/**
	 * 角落的索引列表（用于静态评估）
	 */
	private sumiIndexes: number[] = [];

	/**
	 * 最大回合数
	 */
	private maxTurn;

	/**
	 * 当前回合数
	 */
	private currentTurn = 0;

	/**
	 * 通知对局开始的帖子
	 */
	private startedNote: any = null;

	private get user(): User {
		return this.game.user1Id == this.account.id ? this.game.user2 : this.game.user1;
	}

	private get userName(): string {
		let name = getUserName(this.user);
		if (name.includes('$') || name.includes('<') || name.includes('*')) name = this.user.username;
		return `?[${name}](${config.host}/@${this.user.username})${titles.some(x => name.endsWith(x)) ? '' : 'さん'}`;
	}

	private get strength(): number {
		return this.form.find(i => i.id == 'strength').value;
	}

	private get isSettai(): boolean {
		return this.strength === 0;
	}

	private get allowPost(): boolean {
		return this.form.find(i => i.id == 'publish').value;
	}

	private get url(): string {
		return `${config.host}/reversi/g/${this.game.id}`;
	}

	constructor() {
		process.on('message', this.onMessage);
	}

	private onMessage = async (msg: any) => {
		switch (msg.type) {
			case '_init_': this.onInit(msg.body); break;
			case 'started': this.onStarted(msg.body); break;
			case 'ended': this.onEnded(msg.body); break;
			case 'log': this.onLog(msg.body); break;
		}
	}

	// 从父进程获取数据
	private onInit = (msg: any) => {
		this.game = msg.game;
		this.form = msg.form;
		this.account = msg.account;
	}

	/**
	 * 对局开始时
	 */
	private onStarted = (msg: any) =>  {
		this.game = msg.game;
		if (this.game.canPutEverywhere) { // 不支持
			process.send!({
				type: 'ended'
			});
			process.exit();
		}

		// 在时间线上发布
		this.postGameStarted().then(note => {
			this.startedNote = note;
		});

		// 初始化Reversi引擎
		this.engine = new Reversi.Game(this.game.map, {
			isLlotheo: this.game.isLlotheo,
			canPutEverywhere: this.game.canPutEverywhere,
			loopedBoard: this.game.loopedBoard
		});

		this.maxTurn = this.engine.map.filter(p => p === 'empty').length - this.engine.board.filter(x => x != null).length;

		//#region 角落位置计算等

		//#region 角落
		this.engine.map.forEach((pix, i) => {
			if (pix == 'null') return;

			const [x, y] = this.engine.posToXy(i);
			const get = (x, y) => {
				if (x < 0 || y < 0 || x >= this.engine.mapWidth || y >= this.engine.mapHeight) return 'null';
				return this.engine.mapDataGet(this.engine.xyToPos(x, y));
			};

			const isNotSumi = (
				// -
				//  +
				//   -
				(get(x - 1, y - 1) == 'empty' && get(x + 1, y + 1) == 'empty') ||

				//  -
				//  +
				//  -
				(get(x, y - 1) == 'empty' && get(x, y + 1) == 'empty') ||

				//   -
				//  +
				// -
				(get(x + 1, y - 1) == 'empty' && get(x - 1, y + 1) == 'empty') ||

				//
				// -+-
				//
				(get(x - 1, y) == 'empty' && get(x + 1, y) == 'empty')
			)

			const isSumi = !isNotSumi;

			if (isSumi) this.sumiIndexes.push(i);
		});
		//#endregion

		//#region 角落附近
		this.engine.map.forEach((pix, i) => {
			if (pix == 'null') return;
			if (this.sumiIndexes.includes(i)) return;

			const [x, y] = this.engine.posToXy(i);

			const check = (x, y) => {
				if (x < 0 || y < 0 || x >= this.engine.mapWidth || y >= this.engine.mapHeight) return 0;
				return this.sumiIndexes.includes(this.engine.xyToPos(x, y));
			};

			const isSumiNear = (
				check(x - 1, y - 1) || // 左上
				check(x    , y - 1) || // 上
				check(x + 1, y - 1) || // 右上
				check(x + 1, y    ) || // 右
				check(x + 1, y + 1) || // 右下
				check(x    , y + 1) || // 下
				check(x - 1, y + 1) || // 左下
				check(x - 1, y    )    // 左
			)

			if (isSumiNear) this.sumiNearIndexes.push(i);
		});
		//#endregion

		//#endregion

		this.botColor = this.game.user1Id == this.account.id && this.game.black == 1 || this.game.user2Id == this.account.id && this.game.black == 2;

		if (this.botColor) {
			this.think();
		}
	}

/**
 * 对局结束时
 */
private onEnded = async (msg: any) =>  {
    // 从流中断开
    process.send!({
        type: 'ended'
    });

    let text: string;

    if (msg.game.surrendered) {
        if (this.isSettai) {
            text = serifs.reversi.settaiButYouSurrendered(this.userName);
        } else {
            text = serifs.reversi.youSurrendered(this.userName);
        }
    } else if (msg.winnerId) {
        if (msg.winnerId == this.account.id) {
            if (this.isSettai) {
                text = serifs.reversi.iWonButSettai(this.userName);
            } else {
                text = serifs.reversi.iWon(this.userName);
            }
        } else {
            if (this.isSettai) {
                text = serifs.reversi.iLoseButSettai(this.userName);
            } else {
                text = serifs.reversi.iLose(this.userName);
            }
        }
    } else {
        if (this.isSettai) {
            text = serifs.reversi.drawnSettai(this.userName);
        } else {
            text = serifs.reversi.drawn(this.userName);
        }
    }

    await this.post(text, this.startedNote);

    process.exit();
}

/**
 * 落子时
 */
private onLog = (log: any) => {
    if (log.id == null || !this.appliedOps.includes(log.id)) {
        switch (log.operation) {
            case 'put': {
                this.engine.putStone(log.pos);
                this.currentTurn++;

                if (this.engine.turn === this.botColor) {
                    this.think();
                }
                break;
            }

            default:
                break;
        }
    }
}

/**
 * 静态评估当前局面对Bot的有利程度
 * 静态评估意味着仅根据当前棋盘状态进行评估，而不进行前瞻。
 * TODO: 在接待模式下，完全改变评估逻辑，优先考虑对手是否占据角落。
 */
private staticEval = () => {
    let score = this.engine.getPuttablePlaces(this.botColor).length;

    for (const index of this.sumiIndexes) {
        const stone = this.engine.board[index];

        if (stone === this.botColor) {
            score += 1000; // 自己占据角落，加分
        } else if (stone !== null) {
            score -= 1000; // 对手占据角落，减分
        }
    }

    // TODO: 在这里添加（角落以外的确定石数量 * 100）的评分逻辑

    for (const index of this.sumiNearIndexes) {
        const stone = this.engine.board[index];

        if (stone === this.botColor) {
            score -= 10; // 自己占据角落附近，减分（因为危险）
        } else if (stone !== null) {
            score += 10; // 对手占据角落附近，加分
        }
    }

    // 如果是罗塞奥规则，反转分数
    if (this.game.isLlotheo) score = -score;

    // 如果是接待模式，反转分数
    if (this.isSettai) score = -score;

    return score;
}

private think = () => {
    console.log(`(${this.currentTurn}/${this.maxTurn}) 思考中...`);
    console.time('think');

    // 在接待模式下，全力（约5步前瞻）让对手获胜
    // TODO: 在接待模式下，与其选择对自己不利的落子，不如选择让对手占据角落的落子。
    //       选择对自己不利的落子意味着减少自己的可落子位置，最终可能导致思考的选择范围变窄，难以控制对局。
    //       因此，真正的“让对手获胜”的接待应该是：在游戏的前中期正常落子，进入终盘后再让对手获胜。
    //       但蓝所期望的接待可能只是“让对手占据角落”，因此可以在静态评估中优先考虑“对手是否占据角落”以及“游戏结束时对手是否获胜”。
    const maxDepth = this.isSettai ? 5 : this.strength;

    /**
     * αβ剪枝搜索
     */
    const dive = (pos: number, alpha = -Infinity, beta = Infinity, depth = 0): number => {
        // 试落子
        this.engine.putStone(pos);

        const isBotTurn = this.engine.turn === this.botColor;

        // 游戏结束
        if (this.engine.turn === null) {
            const winner = this.engine.winner;

            // 胜利的基本分数
            const base = 10000;

            let score;

            if (this.game.isLlotheo) {
                // 胜利时，自己的棋子越少，分数越高
                score = this.engine.winner ? base - (this.engine.blackCount * 100) : base - (this.engine.whiteCount * 100);
            } else {
                // 胜利时，对手的棋子越少，分数越高
                score = this.engine.winner ? base + (this.engine.blackCount * 100) : base + (this.engine.whiteCount * 100);
            }

            // 回退落子
            this.engine.undo();

            // 在接待模式下，自己输掉比赛时分数更高
            return this.isSettai
                ? winner !== this.botColor ? score : -score
                : winner === this.botColor ? score : -score;
        }

        if (depth === maxDepth) {
            // 静态评估
            const score = this.staticEval();

            // 回退落子
            this.engine.undo();

            return score;
        } else {
            const cans = this.engine.getPuttablePlaces(this.engine.turn);

            let value = isBotTurn ? -Infinity : Infinity;
            let a = alpha;
            let b = beta;

            // TODO: 在剩余回合数较少（如空位少于12个）时进行完全搜索
            const nextDepth = (this.strength >= 4) && ((this.maxTurn - this.currentTurn) <= 12) ? Infinity : depth + 1;

            // 获取下一回合玩家的最佳落子
            // TODO: 先对cans进行浅层搜索（或使用价值映射）排序，以便更高效地进行剪枝
            for (const p of cans) {
                if (isBotTurn) {
                    const score = dive(p, a, beta, nextDepth);
                    value = Math.max(value, score);
                    a = Math.max(a, value);
                    if (value >= beta) break;
                } else {
                    const score = dive(p, alpha, b, nextDepth);
                    value = Math.min(value, score);
                    b = Math.min(b, value);
                    if (value <= alpha) break;
                }
            }

            // 回退落子
            this.engine.undo();

            return value;
        }
    };

    const cans = this.engine.getPuttablePlaces(this.botColor);
    const scores = cans.map(p => dive(p));
    const pos = cans[scores.indexOf(Math.max(...scores))];

    console.log('思考结果:', pos);
    console.timeEnd('think');

    this.engine.putStone(pos);
    this.currentTurn++;

    setTimeout(() => {
        const id = Math.random().toString(36).slice(2);
        process.send!({
            type: 'putStone',
            pos,
            id
        });
        this.appliedOps.push(id);

        if (this.engine.turn === this.botColor) {
            this.think();
        }
    }, 500);
}

/**
 * 将对局开始的消息发布到Misskey
 */
private postGameStarted = async () => {
    const text = this.isSettai
        ? serifs.reversi.startedSettai(this.userName)
        : serifs.reversi.started(this.userName, this.strength.toString());

    return await this.post(`${text}\n→[观战](${this.url})`);
}

/**
 * 发布消息到Misskey
 * @param text 发布内容
 */
private post = async (text: string, renote?: any) => {
    if (this.allowPost) {
        const body = {
            i: config.i,
            text: text,
            visibility: 'home'
        } as any;

        if (renote) {
            body.renoteId = renote.id;
        }

        try {
            const res = await got.post(`${config.host}/api/notes/create`, {
                json: body
            }).json();

            return res.createdNote;
        } catch (e) {
            console.error(e);
            return null;
        }
    } else {
        return null;
    }
}
}

new Session();
