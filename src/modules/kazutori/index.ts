import { bindThis } from '@/decorators.js';
import loki from 'lokijs';
import Module from '@/module.js';
import Message from '@/message.js';
import serifs from '@/serifs.js';
import type { User } from '@/misskey/user.js';
import { acct } from '@/utils/acct.js';

type Game = {
	votes: {
		user: {
			id: string;
			username: string;
			host: User['host'];
		};
		number: number;
	}[];
	isEnded: boolean;
	startedAt: number;
	postId: string;
};

const limitMinutes = 10;

export default class extends Module {
	public readonly name = 'numberGame';

	private games: loki.Collection<Game>;

	@bindThis
	public install() {
		this.games = this.ai.getCollection('numberGame');

		this.crawleGameEnd();
		setInterval(this.crawleGameEnd, 1000);

		return {
			mentionHook: this.mentionHook,
			contextHook: this.contextHook
		};
	}

	@bindThis
	private async mentionHook(msg: Message) {
		if (!msg.includes(['数字游戏'])) return false;

		const games = this.games.find({});

		const recentGame = games.length == 0 ? null : games[games.length - 1];

		if (recentGame) {
			// 当前有活跃的游戏
			if (!recentGame.isEnded) {
				msg.reply(serifs.numberGame.alreadyStarted, {
					renote: recentGame.postId
				});
				return true;
			}

			// 距离上次游戏不到1小时
			if (Date.now() - recentGame.startedAt < 1000 * 60 * 60) {
				msg.reply(serifs.numberGame.matakondo);
				return true;
			}
		}

		const post = await this.ai.post({
			text: serifs.numberGame.intro(limitMinutes)
		});

		this.games.insertOne({
			votes: [],
			isEnded: false,
			startedAt: Date.now(),
			postId: post.id
		});

		this.subscribeReply(null, post.id);

		this.log('新数字游戏已开始');

		return true;
	}

	@bindThis
	private async contextHook(key: any, msg: Message) {
		if (msg.text == null) return {
			reaction: 'hmm'
		};

		const game = this.games.findOne({
			isEnded: false
		});

		// 处理流程上，实际上不会为null，但为了保险起见
		if (game == null) return;

		// 如果已经提交过数字
		if (game.votes.some(x => x.user.id == msg.userId)) return {
			reaction: 'confused'
		};

		const match = msg.extractedText.match(/[0-9]+/);
		if (match == null) return {
			reaction: 'hmm'
		};

		const num = parseInt(match[0], 10);

		// 不是整数
		if (!Number.isInteger(num)) return {
			reaction: 'hmm'
		};

		// 超出范围
		if (num < 0 || num > 100) return {
			reaction: 'confused'
		};

		this.log(`用户 ${msg.user.id} 提交了数字 ${num}`);

		// 提交数字
		game.votes.push({
			user: {
				id: msg.user.id,
				username: msg.user.username,
				host: msg.user.host
			},
			number: num
		});

		this.games.update(game);

		return {
			reaction: 'like'
		};
	}

	/**
	 * 检查是否有需要结束的游戏
	 */
	@bindThis
	private crawleGameEnd() {
		const game = this.games.findOne({
			isEnded: false
		});

		if (game == null) return;

		// 如果超过限制时间
		if (Date.now() - game.startedAt >= 1000 * 60 * limitMinutes) {
			this.finish(game);
		}
	}

	/**
	 * 结束游戏
	 */
	@bindThis
	private finish(game: Game) {
		game.isEnded = true;
		this.games.update(game);

		this.log('数字游戏已结束');

		// 如果参与人数不足
		if (game.votes.length <= 1) {
			this.ai.post({
				text: serifs.numberGame.onagare,
				renoteId: game.postId
			});

			return;
		}

		let results: string[] = [];
		let winner: Game['votes'][0]['user'] | null = null;

		for (let i = 100; i >= 0; i--) {
			const users = game.votes
				.filter(x => x.number == i)
				.map(x => x.user);

			if (users.length == 1) {
				if (winner == null) {
					winner = users[0];
					const icon = i == 100 ? '💯' : '🎉';
					results.push(`${icon} **${i}**: $[jelly ${acct(users[0])}]`);
				} else {
					results.push(`➖ ${i}: ${acct(users[0])}`);
				}
			} else if (users.length > 1) {
				results.push(`❌ ${i}: ${users.map(u => acct(u)).join(' ')}`);
			}
		}

		const winnerFriend = winner ? this.ai.lookupFriend(winner.id) : null;
		const name = winnerFriend ? winnerFriend.name : null;

		const text = results.join('\n') + '\n\n' + (winner
			? serifs.numberGame.finishWithWinner(acct(winner), name)
			: serifs.numberGame.finishWithNoWinner);

		this.ai.post({
			text: text,
			cw: serifs.numberGame.finish,
			renoteId: game.postId
		});

		this.unsubscribeReply(null);
	}
}