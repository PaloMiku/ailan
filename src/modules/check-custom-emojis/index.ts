import { bindThis } from '@/decorators.js';
import loki from 'lokijs';
import Module from '@/module.js';
import serifs from '@/serifs.js';
import config from '@/config.js';
import Message from '@/message.js';

export default class extends Module {
	public readonly name = 'checkCustomEmojis';

	private lastEmoji: loki.Collection<{
		id: string;
		updatedAt: number;
	}>;

	@bindThis
	public install() {
		if (!config.checkEmojisEnabled) return {};
		this.lastEmoji = this.ai.getCollection('lastEmoji', {
			indices: ['id']
		});

		this.timeCheck();
		setInterval(this.timeCheck, 1000 * 60 * 3);

		return {
			mentionHook: this.mentionHook
		};
	}

	@bindThis
	private timeCheck() {
		const now = new Date();
		if (now.getHours() !== 23) return;
		const date = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
		const data = this.getData();
		if (data.lastPosted == date) return;
		data.lastPosted = date;
		this.setData(data);

		this.log('Time to Check CustomEmojis!');
		this.post();
	}

	@bindThis
	private async post(byMentionHook:boolean = false) {
		this.log('Start to Check CustomEmojis.');
		const lastEmoji = this.lastEmoji.find({});

		const lastId = lastEmoji.length != 0 ? lastEmoji[0].id : null;
		let emojisData:any[] | null = null;
		try {
			emojisData = await this.checkCumstomEmojis(lastId);
		} catch (err: unknown) {
			this.log('Error By API(admin/emoji/list)');
			if (err instanceof Error) {
				this.log(`${err.name}\n${err.message}`);
			}
		}
		if (emojisData === null) {
			const errMessage = '由于缺少read:admin:emoji权限，发生了错误。\n请检查是否已授予自定义表情管理权限。';
			this.log(errMessage);
			await this.ai.post({
				text: errMessage
			});
			return;
		}
		else if (emojisData.length == 0) {
			this.log('未添加 CustomEmojis.');
			if (byMentionHook) {
				await this.ai.post({
					text: serifs.checkCustomEmojis.nothing
				});
			}
			return;
		}

		// 如果获取到了表情数据，则预先删除原始数据
		const emojiSize = emojisData.length;
		this.lastEmoji.remove(lastEmoji);

		const server_name = config.serverName ? config.serverName : 'このサーバー';
		this.log('Posting...');

		// 不一次性发布的版本。
		if (!config.checkEmojisAtOnce){
			// 发布关于概要的内容
			this.log(serifs.checkCustomEmojis.post(server_name, emojiSize));
			await this.ai.post({
				text: serifs.checkCustomEmojis.post(server_name, emojiSize)
			});

			// 发布关于每个表情的内容
			for (const emoji of emojisData){
				await this.ai.post({
					text: serifs.checkCustomEmojis.emojiPost(emoji.name)
				});
				this.log(serifs.checkCustomEmojis.emojiPost(emoji.name));
			}
		} else {
			// 一次性发布的版本。
			let text = '';
			for (const emoji of emojisData){
				text += serifs.checkCustomEmojis.emojiOnce(emoji.name);
			}
			const message = serifs.checkCustomEmojis.postOnce(server_name, emojiSize, text);
			this.log(message);
			await this.ai.post({
				text: message
			});
		}

		// 保存数据
		this.log('Last CustomEmojis data saving...');
		this.log(JSON.stringify(emojisData[emojiSize-1],null,'\t'));
		this.lastEmoji.insertOne({
			id: emojisData[emojiSize-1].id,
			updatedAt: Date.now()
		});
		this.log('Check CustomEmojis finished!');
	}

	@bindThis
	private async checkCumstomEmojis(lastId : any) {
		this.log('CustomEmojis fetching...');
		let emojisData;
		if(lastId != null){
			this.log('lastId is **not** null');
			emojisData = await this.ai.api('admin/emoji/list', {
				sinceId: lastId,
				limit: 30
			});
		} else {
			this.log('lastId is null');
			emojisData = await this.ai.api('admin/emoji/list', {
				limit: 100
			});

			// 获取到最后
			let beforeEmoji = null;
			let afterEmoji = emojisData.length > 1 ? emojisData[0] : null;
			while(emojisData.length == 100 && beforeEmoji != afterEmoji){
				const lastId = emojisData[emojisData.length-1].id;
				// 指定sinceId并重新获取。
				emojisData = await this.ai.api('admin/emoji/list', {
					limit: 100,
					sinceId: lastId
				});
				beforeEmoji = afterEmoji;
				afterEmoji = emojisData.length > 1 ? emojisData[0] : null;
				await this.sleep(50);
			}

			// 如果sinceId未指定，则默认获取末尾的5条左右数据。
			let newJson: any[] = [];
			for (let i = emojisData.length - 5; i < emojisData.length; i++) {
				newJson.push(emojisData[i]);
			}
			emojisData = newJson;
		}
		return emojisData;
	}

	@bindThis
	private async mentionHook(msg: Message) {
		if (!msg.includes(['自定义表情检查', '自定义表情检查', '检查自定义表情', '确认自定义表情'])) {
			return false;
		} else {
			this.log('请求检查自定义表情');
		}

		await this.post(true);

		return {
			reaction: 'like'
		};
	}

	@bindThis
	private async sleep(ms: number) {
		return new Promise((res) => setTimeout(res, ms));
	}
}
