import { bindThis } from '@/decorators.js';
import Module from '@/module.js';
import serifs from '@/serifs.js';
import { genMaze } from './gen-maze.js';
import { renderMaze } from './render-maze.js';
import Message from '@/message.js';

export default class extends Module {
	public readonly name = 'maze';

	@bindThis
	public install() {
		this.post();
		setInterval(this.post, 1000 * 60 * 3);

		return {
			mentionHook: this.mentionHook
		};
	}

	@bindThis
	private async post() {
		const now = new Date();
		if (now.getHours() !== 22) return;
		const date = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
		const data = this.getData();
		if (data.lastPosted == date) return;
		data.lastPosted = date;
		this.setData(data);

		this.log('时间到了，生成迷宫');
		const file = await this.genMazeFile(date);

		this.log('正在发布...');
		this.ai.post({
			text: serifs.maze.post,
			fileIds: [file.id]
		});
	}

	@bindThis
	private async genMazeFile(seed, size?): Promise<any> {
		this.log('正在生成迷宫...');
		const maze = genMaze(seed, size);

		this.log('正在渲染迷宫...');
		const data = renderMaze(seed, maze);

		this.log('正在上传图片...');
		const file = await this.ai.upload(data, {
			filename: 'maze.png',
			contentType: 'image/png'
		});

		return file;
	}

	@bindThis
	private async mentionHook(msg: Message) {
		if (msg.includes(['迷宫'])) {
			let size: string | null = null;
			if (msg.includes(['接待'])) size = 'veryEasy';
			if (msg.includes(['简单', '容易', '小'])) size = 'easy';
			if (msg.includes(['困难', '复杂', '大'])) size = 'hard';
			if (msg.includes(['死亡', '魔鬼', '地狱'])) size = 'veryHard';
			if (msg.includes(['蓝']) && msg.includes(['认真'])) size = 'ai';
			this.log('收到迷宫请求');
			setTimeout(async () => {
				const file = await this.genMazeFile(Date.now(), size);
				this.log('正在回复...');
				msg.reply(serifs.maze.foryou, { file });
			}, 3000);
			return {
				reaction: 'like'
			};
		} else {
			return false;
		}
	}
}