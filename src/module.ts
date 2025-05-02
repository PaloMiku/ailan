import { bindThis } from '@/decorators.js';
import 蓝, { InstallerResult } from '@/ai.js';

export default abstract class Module {
	public abstract readonly name: string;

	protected ai: 蓝;
	private doc: any;

	public init(ai: 蓝) {
		this.ai = ai;

		this.doc = this.ai.moduleData.findOne({
			module: this.name
		});

		if (this.doc == null) {
			this.doc = this.ai.moduleData.insertOne({
				module: this.name,
				data: {}
			});
		}
	}

	public abstract install(): InstallerResult;

	@bindThis
	protected log(msg: string) {
		this.ai.log(`[${this.name}]: ${msg}`);
	}

	/**
	 * 生成上下文，并等待用户的回复
	 * @param key 用于识别上下文的键
	 * @param id 如果是聊天消息上的上下文则为聊天对象的ID，否则为等待的帖子ID
	 * @param data 保存在上下文中的可选数据
	 */
	@bindThis
	protected subscribeReply(key: string | null, id: string, data?: any) {
		this.ai.subscribeReply(this, key, id, data);
	}

	/**
	 * 取消等待回复
	 * @param key 用于识别上下文的键
	 */
	@bindThis
	protected unsubscribeReply(key: string | null) {
		this.ai.unsubscribeReply(this, key);
	}

	/**
	 * 在指定的毫秒数后，调用超时回调。
	 * 此计时器会持久化到存储中，因此即使中途重启进程也仍然有效。
	 * @param delay 毫秒数
	 * @param data 可选数据
	 */
	@bindThis
	public setTimeoutWithPersistence(delay: number, data?: any) {
		this.ai.setTimeoutWithPersistence(this, delay, data);
	}

	@bindThis
	protected getData() {
		return this.doc.data;
	}

	@bindThis
	protected setData(data: any) {
		this.doc.data = data;
		this.ai.moduleData.update(this.doc);
	}
}
