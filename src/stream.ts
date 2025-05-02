import { bindThis } from '@/decorators.js';
import { EventEmitter } from 'events';
import WebSocket from 'ws';
import _ReconnectingWebsocket from 'reconnecting-websocket';
import config from './config.js';

const ReconnectingWebsocket = _ReconnectingWebsocket as unknown as typeof _ReconnectingWebsocket['default'];

/**
 * Misskey stream connection
 */
export default class Stream extends EventEmitter {
	private stream: any;
	private state: string;
	private buffer: any[];
	private sharedConnectionPools: Pool[] = [];
	private sharedConnections: SharedConnection[] = [];
	private nonSharedConnections: NonSharedConnection[] = [];

	constructor() {
		super();

		this.state = 'initializing';
		this.buffer = [];

		this.stream = new ReconnectingWebsocket(`${config.wsUrl}/streaming?i=${config.i}`, [], {
			WebSocket: WebSocket
		});
		this.stream.addEventListener('open', this.onOpen);
		this.stream.addEventListener('close', this.onClose);
		this.stream.addEventListener('message', this.onMessage);
	}

	@bindThis
	public useSharedConnection(channel: string): SharedConnection {
		let pool = this.sharedConnectionPools.find(p => p.channel === channel);

		if (pool == null) {
			pool = new Pool(this, channel);
			this.sharedConnectionPools.push(pool);
		}

		const connection = new SharedConnection(this, channel, pool);
		this.sharedConnections.push(connection);
		return connection;
	}

	@bindThis
	public removeSharedConnection(connection: SharedConnection) {
		this.sharedConnections = this.sharedConnections.filter(c => c !== connection);
	}

	@bindThis
	public connectToChannel(channel: string, params?: any): NonSharedConnection {
		const connection = new NonSharedConnection(this, channel, params);
		this.nonSharedConnections.push(connection);
		return connection;
	}

	@bindThis
	public disconnectToChannel(connection: NonSharedConnection) {
		this.nonSharedConnections = this.nonSharedConnections.filter(c => c !== connection);
	}

	/**
	 * Callback of when open connection
	 */
	@bindThis
	private onOpen() {
		const isReconnect = this.state == 'reconnecting';

		this.state = 'connected';
		this.emit('_connected_');

		// 处理缓冲区
		const _buffer = [...this.buffer]; // Shallow copy
		this.buffer = []; // Clear buffer
		for (const data of _buffer) {
			this.send(data); // Resend each buffered messages
		}

		// 重新连接频道
		if (isReconnect) {
			this.sharedConnectionPools.forEach(p => {
				p.connect();
			});
			this.nonSharedConnections.forEach(c => {
				c.connect();
			});
		}
	}

	/**
	 * Callback of when close connection
	 */
	@bindThis
	private onClose() {
		this.state = 'reconnecting';
		this.emit('_disconnected_');
	}

	/**
	 * Callback of when received a message from connection
	 */
	@bindThis
	private onMessage(message) {
		const { type, body } = JSON.parse(message.data);

		if (type == 'channel') {
			const id = body.id;

			let connections: (Connection | undefined)[];

			connections = this.sharedConnections.filter(c => c.id === id);

			if (connections.length === 0) {
				connections = [this.nonSharedConnections.find(c => c.id === id)];
			}

			for (const c of connections.filter(c => c != null)) {
				c!.emit(body.type, body.body);
				c!.emit('*', { type: body.type, body: body.body });
			}
		} else {
			this.emit(type, body);
			this.emit('*', { type, body });
		}
	}

	/**
	 * Send a message to connection
	 */
	@bindThis
	public send(typeOrPayload, payload?) {
		const data = payload === undefined ? typeOrPayload : {
			type: typeOrPayload,
			body: payload
		};

		// 如果连接尚未建立，则进行缓冲，待下次连接时发送。
		if (this.state != 'connected') {
			this.buffer.push(data);
			return;
		}

		this.stream.send(JSON.stringify(data));
	}

	/**
	 * Close this connection
	 */
	@bindThis
	public close() {
		this.stream.removeEventListener('open', this.onOpen);
		this.stream.removeEventListener('message', this.onMessage);
	}
}

class Pool {
	public channel: string;
	public id: string;
	protected stream: Stream;
	private users = 0;
	private disposeTimerId: any;
	private isConnected = false;

	constructor(stream: Stream, channel: string) {
		this.channel = channel;
		this.stream = stream;

		this.id = Math.random().toString();
	}

	@bindThis
	public inc() {
		if (this.users === 0 && !this.isConnected) {
			this.connect();
		}

		this.users++;

		// 取消定时器
		if (this.disposeTimerId) {
			clearTimeout(this.disposeTimerId);
			this.disposeTimerId = null;
		}
	}

	@bindThis
	public dec() {
		this.users--;

		// 当该连接的使用者全部消失时
		if (this.users === 0) {
			// 由于可能很快会被再次使用，因此等待一段时间，
			// 如果没有新的使用者出现，则断开连接
			this.disposeTimerId = setTimeout(() => {
				this.disconnect();
			}, 3000);
		}
	}

	@bindThis
	public connect() {
		this.isConnected = true;
		this.stream.send('connect', {
			channel: this.channel,
			id: this.id
		});
	}

	@bindThis
	private disconnect() {
		this.isConnected = false;
		this.disposeTimerId = null;
		this.stream.send('disconnect', { id: this.id });
	}
}

abstract class Connection extends EventEmitter {
	public channel: string;
	protected stream: Stream;
	public abstract id: string;

	constructor(stream: Stream, channel: string) {
		super();

		this.stream = stream;
		this.channel = channel;
	}

	@bindThis
	public send(id: string, typeOrPayload, payload?) {
		const type = payload === undefined ? typeOrPayload.type : typeOrPayload;
		const body = payload === undefined ? typeOrPayload.body : payload;

		this.stream.send('ch', {
			id: id,
			type: type,
			body: body
		});
	}

	public abstract dispose(): void;
}

class SharedConnection extends Connection {
	private pool: Pool;

	public get id(): string {
		return this.pool.id;
	}

	constructor(stream: Stream, channel: string, pool: Pool) {
		super(stream, channel);

		this.pool = pool;
		this.pool.inc();
	}

	@bindThis
	public send(typeOrPayload, payload?) {
		super.send(this.pool.id, typeOrPayload, payload);
	}

	@bindThis
	public dispose() {
		this.pool.dec();
		this.removeAllListeners();
		this.stream.removeSharedConnection(this);
	}
}

class NonSharedConnection extends Connection {
	public id: string;
	protected params: any;

	constructor(stream: Stream, channel: string, params?: any) {
		super(stream, channel);

		this.params = params;
		this.id = Math.random().toString();

		this.connect();
	}

	@bindThis
	public connect() {
		this.stream.send('connect', {
			channel: this.channel,
			id: this.id,
			params: this.params
		});
	}

	@bindThis
	public send(typeOrPayload, payload?) {
		super.send(this.id, typeOrPayload, payload);
	}

	@bindThis
	public dispose() {
		this.removeAllListeners();
		this.stream.send('disconnect', { id: this.id });
		this.stream.disconnectToChannel(this);
	}
}
