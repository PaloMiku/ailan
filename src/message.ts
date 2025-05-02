import { bindThis } from '@/decorators.js';
import chalk from 'chalk';

import 蓝 from '@/ai.js';
import Friend from '@/friend.js';
import type { User } from '@/misskey/user.js';
import includes from '@/utils/includes.js';
import or from '@/utils/or.js';
import config from '@/config.js';
import { sleep } from '@/utils/sleep.js';

export default class Message {
	private ai: 蓝;
	private note: any;

	public get id(): string {
		return this.note.id;
	}

	public get user(): User {
		return this.note.user;
	}

	public get userId(): string {
		return this.note.userId;
	}

	public get text(): string {
		return this.note.text;
	}

	public get quoteId(): string | null {
		return this.note.renoteId;
	}

	public get visibility(): string {
		return this.note.visibility;
	}

	/**
	 * 去除提及部分的文本正文
	 */
	public get extractedText(): string {
		const host = new URL(config.host).host.replace(/\./g, '\\.');
		return this.text
			.replace(new RegExp(`^@${this.ai.account.username}@${host}\\s`, 'i'), '')
			.replace(new RegExp(`^@${this.ai.account.username}\\s`, 'i'), '')
			.trim();
	}

	public get replyId(): string {
		return this.note.replyId;
	}

	public friend: Friend;

	constructor(ai: 蓝, note: any) {
		this.ai = ai;
		this.note = note;

		this.friend = new Friend(ai, { user: this.user });

		// 由于附加在消息等中的用户信息可能被省略，因此需要获取完整的用户信息
		this.ai.api('users/show', {
			userId: this.userId
		}).then(user => {
			this.friend.updateUser(user);
		});
	}

	@bindThis
	public async reply(text: string | null, opts?: {
		file?: any;
		cw?: string;
		renote?: string;
		immediate?: boolean;
	}) {
		if (text == null) return;

		this.ai.log(`>>> Sending reply to ${chalk.underline(this.id)}`);

		if (!opts?.immediate) {
			await sleep(2000);
		}

		const postData = {
			replyId: this.note.id,
			text: text,
			fileIds: opts?.file ? [opts?.file.id] : undefined,
			cw: opts?.cw,
			renoteId: opts?.renote
		};

		// 除了私信以外正常回复，如果是私信则用私信回复
		if (this.note.visibility != 'specified') {
			return await this.ai.post(postData);
		} else {
			return await this.ai.sendMessage(this.userId, postData);
		}
	}

	@bindThis
	public includes(words: string[]): boolean {
		return includes(this.text, words);
	}

	@bindThis
	public or(words: (string | RegExp)[]): boolean {
		return or(this.text, words);
	}
}
