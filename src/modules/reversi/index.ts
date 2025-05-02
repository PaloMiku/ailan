import * as childProcess from 'child_process';
import { bindThis } from '@/decorators.js';
import Module from '@/module.js';
import serifs from '@/serifs.js';
import config from '@/config.js';
import Message from '@/message.js';
import Friend from '@/friend.js';
import getDate from '@/utils/get-date.js';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

export default class extends Module {
	public readonly name = 'reversi';

	/**
	 * 黑白棋流
	 */
	private reversiConnection?: any;

	@bindThis
	public install() {
		if (!config.reversiEnabled) return {};

		this.reversiConnection = this.ai.connection.useSharedConnection('reversi');

		// 收到邀请时
		this.reversiConnection.on('invited', msg => this.onReversiInviteMe(msg.user));

		// 匹配成功时
		this.reversiConnection.on('matched', msg => this.onReversiGameStart(msg.game));

		if (config.reversiEnabled) {
			const mainStream = this.ai.connection.useSharedConnection('main');
			mainStream.on('pageEvent', msg => {
				if (msg.event === 'inviteReversi') {
					this.ai.api('games/reversi/match', {
						userId: msg.user.id
					});
				}
			});
		}

		return {
			mentionHook: this.mentionHook
		};
	}

	@bindThis
	private async mentionHook(msg: Message) {
		if (msg.includes(['リバーシ', 'オセロ', 'reversi', 'othello'])) {
			if (config.reversiEnabled) {
				msg.reply(serifs.reversi.ok);

				if (msg.includes(['接待'])) {
					msg.friend.updateReversiStrength(0);
				}

				this.ai.api('reversi/match', {
					userId: msg.userId
				});
			} else {
				msg.reply(serifs.reversi.decline);
			}

			return true;
		} else {
			return false;
		}
	}

	@bindThis
	private async onReversiInviteMe(inviter: any) {
		this.log(`有人邀请了我: @${inviter.username}`);

		if (config.reversiEnabled) {
			// 接受邀请
			const game = await this.ai.api('reversi/match', {
				userId: inviter.id
			});

			this.onReversiGameStart(game);
		} else {
			// TODO（通过消息告知无法进行黑白棋等）
		}
	}

	@bindThis
	private onReversiGameStart(game: any) {
		let strength = 4;
		const friend = this.ai.lookupFriend(game.user1Id !== this.ai.account.id ? game.user1Id : game.user2Id)!;
		if (friend != null) {
			strength = friend.doc.reversiStrength ?? 4;
			friend.updateReversiStrength(null);
		}

		this.log(`进入黑白棋游戏房间: ${game.id}`);

		// 连接到游戏流
		const gw = this.ai.connection.connectToChannel('reversiGame', {
			gameId: game.id
		});

		// 表单
		const form = [{
			id: 'publish',
			type: 'switch',
			label: '允许蓝发布对局信息',
			value: true,
		}, {
			id: 'strength',
			type: 'radio',
			label: '强度',
			value: strength,
			items: [{
				label: '接待',
				value: 0
			}, {
				label: '弱',
				value: 2
			}, {
				label: '中',
				value: 3
			}, {
				label: '强',
				value: 4
			}, {
				label: '最强',
				value: 5
			}]
		}];

		//#region 启动后端进程
		const ai = childProcess.fork(_dirname + '/back.js');

		// 向后端进程传递信息
		ai.send({
			type: '_init_',
			body: {
				game: game,
				form: form,
				account: this.ai.account
			}
		});

		ai.on('message', (msg: Record<string, any>) => {
			if (msg.type == 'putStone') {
				gw.send('putStone', {
					pos: msg.pos,
					id: msg.id,
				});
			} else if (msg.type == 'ended') {
				gw.dispose();

				this.onGameEnded(game);
			}
		});

		// 将游戏流中的信息直接传递给后端进程
		gw.addListener('*', message => {
			ai.send(message);

			if (message.type === 'updateSettings') {
				if (message.body.key === 'canPutEverywhere') {
					if (message.body.value === true) {
						gw.send('ready', false);
					} else {
						gw.send('ready', true);
					}
				}
			}
		});
		//#endregion

		// 接受任何设置的对局
		setTimeout(() => {
			gw.send('ready', true);
		}, 1000);
	}

	@bindThis
	private onGameEnded(game: any) {
		const user = game.user1Id == this.ai.account.id ? game.user2 : game.user1;

		//#region 每天只增加一次亲密度
		const today = getDate();

		const friend = new Friend(this.ai, { user: user });

		const data = friend.getPerModulesData(this);

		if (data.lastPlayedAt != today) {
			data.lastPlayedAt = today;
			friend.setPerModulesData(this, data);

			friend.incLove();
		}
		//#endregion
	}
}