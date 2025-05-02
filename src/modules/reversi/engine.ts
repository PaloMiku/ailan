/**
 * true ... 黑
 * false ... 白
 */
export type Color = boolean;
const BLACK = true;
const WHITE = false;

export type MapCell = 'null' | 'empty';

export type Options = {
	isLlotheo: boolean;
	canPutEverywhere: boolean;
	loopedBoard: boolean;
};

export type Undo = {
	color: Color;
	pos: number;

	/**
	 * 被翻转的石子的位置数组
	 */
	effects: number[];

	turn: Color | null;
};

export class Game {
	public map: MapCell[];
	public mapWidth: number;
	public mapHeight: number;
	public board: (Color | null | undefined)[];
	public turn: Color | null = BLACK;
	public opts: Options;

	public prevPos = -1;
	public prevColor: Color | null = null;

	private logs: Undo[] = [];

	constructor(map: string[], opts: Options) {
		//#region 绑定
		this.putStone = this.putStone.bind(this);
		//#endregion

		//#region 选项
		this.opts = opts;
		if (this.opts.isLlotheo == null) this.opts.isLlotheo = false;
		if (this.opts.canPutEverywhere == null) this.opts.canPutEverywhere = false;
		if (this.opts.loopedBoard == null) this.opts.loopedBoard = false;
		//#endregion

		//#region 解析地图数据
		this.mapWidth = map[0].length;
		this.mapHeight = map.length;
		const mapData = map.join('');

		this.board = mapData.split('').map(d => d === '-' ? null : d === 'b' ? BLACK : d === 'w' ? WHITE : undefined);

		this.map = mapData.split('').map(d => d === '-' || d === 'b' || d === 'w' ? 'empty' : 'null');
		//#endregion

		// 游戏开始时可能只有一方的棋子，或者游戏开始时胜负已定
		if (!this.canPutSomewhere(BLACK)) this.turn = this.canPutSomewhere(WHITE) ? WHITE : null;
	}

	public get blackCount() {
		return this.board.filter(x => x === BLACK).length;
	}

	public get whiteCount() {
		return this.board.filter(x => x === WHITE).length;
	}

	public posToXy(pos: number): number[] {
		const x = pos % this.mapWidth;
		const y = Math.floor(pos / this.mapWidth);
		return [x, y];
	}

	public xyToPos(x: number, y: number): number {
		return x + (y * this.mapWidth);
	}

	public putStone(pos: number) {
		const color = this.turn;
		if (color == null) return;

		this.prevPos = pos;
		this.prevColor = color;

		this.board[pos] = color;

		// 获取可以被翻转的棋子
		const effects = this.effects(color, pos);

		// 翻转棋子
		for (const pos of effects) {
			this.board[pos] = color;
		}

		const turn = this.turn;

		this.logs.push({
			color,
			pos,
			effects,
			turn,
		});

		this.calcTurn();
	}

	private calcTurn() {
		// 计算下一回合
		this.turn =
			this.canPutSomewhere(!this.prevColor) ? !this.prevColor :
			this.canPutSomewhere(this.prevColor!) ? this.prevColor :
			null;
	}

	public undo() {
		const undo = this.logs.pop()!;
		this.prevColor = undo.color;
		this.prevPos = undo.pos;
		this.board[undo.pos] = null;
		for (const pos of undo.effects) {
			const color = this.board[pos];
			this.board[pos] = !color;
		}
		this.turn = undo.turn;
	}

	public mapDataGet(pos: number): MapCell {
		const [x, y] = this.posToXy(pos);
		return x < 0 || y < 0 || x >= this.mapWidth || y >= this.mapHeight ? 'null' : this.map[pos];
	}

	public getPuttablePlaces(color: Color): number[] {
		return Array.from(this.board.keys()).filter(i => this.canPut(color, i));
	}

	public canPutSomewhere(color: Color): boolean {
		return this.getPuttablePlaces(color).length > 0;
	}

	public canPut(color: Color, pos: number): boolean {
		return (
			this.board[pos] !== null ? false : // 已经有棋子的位置不能落子
			this.opts.canPutEverywhere ? this.mapDataGet(pos) === 'empty' : // 允许在任何空位落子的模式
			this.effects(color, pos).length !== 0); // 是否可以翻转至少一个对手的棋子
	}

	/**
	 * 获取在指定位置落子时可以被翻转的棋子
	 * @param color 自己的颜色
	 * @param initPos 落子位置
	 */
	public effects(color: Color, initPos: number): number[] {
		const enemyColor = !color;

		const diffVectors: [number, number][] = [
			[0, -1], // 上
			[+1, -1], // 右上
			[+1, 0], // 右
			[+1, +1], // 右下
			[0, +1], // 下
			[-1, +1], // 左下
			[-1, 0], // 左
			[-1, -1], // 左上
		];

		const effectsInLine = ([dx, dy]: [number, number]): number[] => {
			const nextPos = (x: number, y: number): [number, number] => [x + dx, y + dy];

			const found: number[] = []; // 存储可能被翻转的对手棋子
			let [x, y] = this.posToXy(initPos);
			while (true) {
				[x, y] = nextPos(x, y);

				// 如果坐标超出棋盘范围
				if (this.opts.loopedBoard && this.xyToPos(
					(x = ((x % this.mapWidth) + this.mapWidth) % this.mapWidth),
					(y = ((y % this.mapHeight) + this.mapHeight) % this.mapHeight)) === initPos) {
					// 如果棋盘边界循环并回到落子位置，则认为可以翻转（参考：Test4 地图）
					return found;
				} else if (x === -1 || y === -1 || x === this.mapWidth || y === this.mapHeight) return []; // 无法翻转（超出棋盘范围）

				const pos = this.xyToPos(x, y);
				if (this.mapDataGet(pos) === 'null') return []; // 无法翻转（到达不可落子的位置）
				const stone = this.board[pos];
				if (stone === null) return []; // 无法翻转（到达空位）
				if (stone === enemyColor) found.push(pos); // 可能可以翻转（发现对手的棋子）
				if (stone === color) return found; // 可以翻转（发现自己的棋子）
			}
		};

		return ([] as number[]).concat(...diffVectors.map(effectsInLine));
	}

	public get isEnded(): boolean {
		return this.turn === null;
	}

	public get winner(): Color | null {
		return this.isEnded ?
			this.blackCount === this.whiteCount ? null :
			this.opts.isLlotheo === this.blackCount > this.whiteCount ? WHITE : BLACK :
			undefined as never;
	}
}