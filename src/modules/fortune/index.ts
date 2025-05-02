import { bindThis } from '@/decorators.js';
import Module from '@/module.js';
import Message from '@/message.js';
import serifs from '@/serifs.js';
import seedrandom from 'seedrandom';
import { genItem } from '@/vocabulary.js';

export const blessing = [
	'蓝吉',
	'尧塔吉',
	'泽塔吉',
	'艾克萨吉',
	'拍塔吉',
	'太拉吉',
	'吉咖吉',
	'兆吉',
	'千吉',
	'百吉',
	'十吉',
	'分吉',
	'厘吉',
	'毫吉',
	'微吉',
	'纳吉',
	'皮吉',
	'飞吉',
	'阿吉',
	'仄吉',
	'幺吉',
	'超吉',
	'大大吉',
	'大吉',
	'吉',
	'中吉',
	'小吉',
	'凶',
	'大凶',
];

export default class extends Module {
	public readonly name = 'fortune';

	@bindThis
	public install() {
		return {
			mentionHook: this.mentionHook
		};
	}

	@bindThis
	private async mentionHook(msg: Message) {
		if (msg.includes(['占卜', '占', '运势', '抽签'])) {
			const date = new Date();
			const seed = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}@${msg.userId}`;
			const rng = seedrandom(seed);
			const omikuji = blessing[Math.floor(rng() * blessing.length)];
			const item = genItem(rng);
			msg.reply(`**${omikuji}🎉**\n幸运物品: ${item}`, {
				cw: serifs.fortune.cw(msg.friend.name)
			});
			return true;
		} else {
			return false;
		}
	}
}