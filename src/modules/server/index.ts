import { bindThis } from '@/decorators.js';
import Module from '@/module.js';
import serifs from '@/serifs.js';
import config from '@/config.js';

export default class extends Module {
	public readonly name = 'server';

	private connection?: any;
	private recentStat: any;
	private warned = false;
	private lastWarnedAt: number;

	/**
	 * 1分钟内的每秒日志记录
	 */
	private statsLogs: any[] = [];

	@bindThis
	public install() {
		if (!config.serverMonitoring) return {};

		this.connection = this.ai.connection.useSharedConnection('serverStats');
		this.connection.on('stats', this.onStats);

		setInterval(() => {
			this.statsLogs.unshift(this.recentStat);
			if (this.statsLogs.length > 60) this.statsLogs.pop();
		}, 1000);

		setInterval(() => {
			this.check();
		}, 3000);

		return {};
	}

	@bindThis
	private check() {
		const average = (arr) => arr.reduce((a, b) => a + b) / arr.length;

		const cpuPercentages = this.statsLogs.map(s => s && (s.cpu_usage || s.cpu) * 100 || 0);
		const cpuPercentage = average(cpuPercentages);
		if (cpuPercentage >= 70) {
			this.warn();
		} else if (cpuPercentage <= 30) {
			this.warned = false;
		}
	}

	@bindThis
	private async onStats(stats: any) {
		this.recentStat = stats;
	}

	@bindThis
	private warn() {
		//#region 如果在之前警告后没有经历过一段平静的状态，则不发出警告
		// 为了防止在持续高负载的服务器上无限发出警告
		if (this.warned) return;
		//#endregion

		//#region 如果距离上次警告未满1小时，则不发出警告
		const now = Date.now();

		if (this.lastWarnedAt != null) {
			if (now - this.lastWarnedAt < (1000 * 60 * 60)) return;
		}

		this.lastWarnedAt = now;
		//#endregion

		this.ai.post({
			text: serifs.server.cpu
		});

		this.warned = true;
	}
}
