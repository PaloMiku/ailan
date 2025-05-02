import { bindThis } from '@/decorators.js';
import Message from '@/message.js';
import Module from '@/module.js';
import serifs from '@/serifs.js';
import { genItem } from '@/vocabulary.js';
import config from '@/config.js';
import type { Note } from '@/misskey/note.js';

export default class extends Module {
	public readonly name = 'poll';

	@bindThis
	public install() {
		setInterval(() => {
			if (Math.random() < 0.1) {
				this.post();
			}
		}, 1000 * 60 * 60);

		return {
			mentionHook: this.mentionHook,
			timeoutCallback: this.timeoutCallback,
		};
	}

	@bindThis
	private async post() {
		const duration = 1000 * 60 * 15;

		const polls = [ // TODO: Extract serif
			['稀奇的东西', '大家觉得哪一个最稀奇呢？'],
			['看起来好吃的东西', '大家觉得哪一个最好吃呢？'],
			['看起来很重的东西', '大家觉得哪一个最重呢？'],
			['想要的东西', '大家最想要哪一个呢？'],
			['想带去无人岛的东西', '如果只能带一个去无人岛，大家会选哪一个呢？'],
			['想装饰在家里的东西', '如果要装饰在家里，大家会选哪一个呢？'],
			['看起来好卖的东西', '大家觉得哪一个最畅销呢？'],
			['希望从天而降的东西', '大家希望哪一个从天上掉下来呢？'],
			['想随身携带的东西', '大家想随身携带哪一个呢？'],
			['想商品化的东西', '如果要商品化，大家会选哪一个呢？'],
			['看起来会被发掘的东西', '大家觉得哪一个最有可能从遗迹中被发掘出来呢？'],
			['闻起来很香的东西', '大家觉得哪一个最香呢？'],
			['看起来会高价交易的东西', '大家觉得哪一个会以最高价交易呢？'],
			['看起来会在地球轨道上漂浮的东西', '大家觉得哪一个最有可能在地球轨道上漂浮呢？'],
			['想送给我的东西', '如果要送给我礼物，大家会选哪一个呢？'],
			['想收到的礼物', '如果要收到礼物，大家会选哪一个呢？'],
			['觉得我可能会有的东西', '大家觉得我可能会有哪一个呢？'],
			['看起来会流行起来的东西', '大家觉得哪一个最有可能流行起来呢？'],
			['早餐', '大家早餐想吃哪一个呢？'],
			['午餐', '大家午餐想吃哪一个呢？'],
			['晚餐', '大家晚餐想吃哪一个呢？'],
			['看起来对身体好的东西', '大家觉得哪一个对身体最好呢？'],
			['想留给后世的东西', '大家想把哪一个留给后世呢？'],
			['看起来可以做成乐器的东西', '大家觉得哪一个最有可能做成乐器呢？'],
			['想放在味噌汤里的东西', '如果要放在味噌汤里，大家会选哪一个呢？'],
			['想撒在饭上的东西', '大家想把哪一个撒在饭上呢？'],
			['经常看到的东西', '大家经常看到哪一个呢？'],
			['看起来会掉在路上的东西', '大家觉得哪一个最有可能掉在路上呢？'],
			['看起来会放在美术馆的东西', '大家觉得哪一个最有可能放在美术馆里呢？'],
			['看起来会在教室里的东西', '大家觉得哪一个最有可能在教室里呢？'],
			['希望变成表情符号的东西', '大家希望哪一个变成表情符号呢？'],
			['看起来会在Misskey总部的东西', '大家觉得哪一个最有可能在Misskey总部呢？'],
			['可燃垃圾', '大家觉得哪一个属于可燃垃圾呢？'],
			['喜欢的饭团馅料', '大家喜欢的饭团馅料是什么呢？'],
		];

		const poll = polls[Math.floor(Math.random() * polls.length)];

		const choices = [
			genItem(),
			genItem(),
			genItem(),
			genItem(),
		];

		const note = await this.ai.post({
			text: poll[1],
			poll: {
				choices,
				expiredAfter: duration,
				multiple: false,
			}
		});

		// 设置定时器
		this.setTimeoutWithPersistence(duration + 3000, {
			title: poll[0],
			noteId: note.id,
		});
	}

	@bindThis
	private async mentionHook(msg: Message) {
		if (!msg.or(['/poll']) || msg.user.username !== config.master) {
			return false;
		} else {
			this.log('手动投票请求');
		}

		this.post();

		return true;
	}

	@bindThis
	private async timeoutCallback({ title, noteId }) {
		const note: Note = await this.ai.api('notes/show', { noteId });

		const choices = note.poll!.choices;

		let mostVotedChoice;

		for (const choice of choices) {
			if (mostVotedChoice == null) {
				mostVotedChoice = choice;
				continue;
			}

			if (choice.votes > mostVotedChoice.votes) {
				mostVotedChoice = choice;
			}
		}

		const mostVotedChoices = choices.filter(choice => choice.votes === mostVotedChoice.votes);

		if (mostVotedChoice.votes === 0) {
			this.ai.post({ // TODO: Extract serif
				text: '没有投票',
				renoteId: noteId,
			});
		} else if (mostVotedChoices.length === 1) {
			this.ai.post({ // TODO: Extract serif
				cw: `${title}投票结果公布！`,
				text: `结果是${mostVotedChoice.votes}票的「${mostVotedChoice.text}」！`,
				renoteId: noteId,
			});
		} else {
			const choices = mostVotedChoices.map(choice => `「${choice.text}」`).join('和');
			this.ai.post({ // TODO: Extract serif
				cw: `${title}投票结果公布！`,
				text: `结果是${mostVotedChoice.votes}票的${choices}！`,
				renoteId: noteId,
			});
		}
	}
}