// 台词

export default {
	core: {
		setNameOk: name => `明白了。以后我就称呼你为${name}吧！`,

		san: '需要加上“さん”吗？',

		yesOrNo: '我只能理解“是”或“不是”...',

		hello: name => name ? `你好，${name}♪` : `你好♪`,

		helloNight: name => name ? `晚上好，${name}♪` : `晚上好♪`,

		goodMorning: (tension, name) => name ? `早上好，${name}！${tension}` : `早上好！${tension}`,

		/*
		goodMorning: {
			normal: (tension, name) => name ? `早上好，${name}！${tension}` : `早上好！${tension}`,

			hiru: (tension, name) => name ? `早上好，${name}！${tension}已经是中午了哦？${tension}` : `早上好！${tension}已经是中午了哦？${tension}`,
		},
*/

		goodNight: name => name ? `晚安，${name}！` : '晚安！',

		omedeto: name => name ? `谢谢你，${name}♪` : '谢谢你♪',

		erait: {
			general: name => name ? [
				`${name}，今天也很棒呢！`,
				`${name}，今天也很棒哦～♪`
			] : [
				`今天也很棒呢！`,
				`今天也很棒哦～♪`
			],

			specify: (thing, name) => name ? [
				`${name}，${thing}很厉害呢！`,
				`${name}，${thing}很厉害哦～♪`
			] : [
				`${thing}很厉害呢！`,
				`${thing}很厉害哦～♪`
			],

			specify2: (thing, name) => name ? [
				`${name}，${thing}很了不起呢！`,
				`${name}，${thing}很了不起哦～♪`
			] : [
				`${thing}很了不起呢！`,
				`${thing}很了不起哦～♪`
			],
		},

		okaeri: {
			love: name => name ? [
				`欢迎回来，${name}♪`,
				`欢迎回来，${name}。`
			] : [
				'欢迎回来♪',
				'欢迎回来，主人。'
			],

			love2: name => name ? `欢迎回来♡♡♡${name}♡♡♡♡♡` : '欢迎回来♡♡♡主人♡♡♡♡♡',

			normal: name => name ? `欢迎回来，${name}！` : '欢迎回来！',
		},

		itterassyai: {
			love: name => name ? `路上小心，${name}♪` : '路上小心♪',

			normal: name => name ? `路上小心，${name}！` : '路上小心！',
		},

		tooLong: '感觉太长了...',

		invalidName: '感觉发音有点难',

		nadenade: {
			normal: '呀…！ 吓了我一跳',

			love2: ['哇哇… 好害羞', '啊呜… 好害羞…', '呼呀…？'],

			love3: ['嗯… 谢谢你♪', '哇，感觉好安心呢♪', '唔嗯… 好安心…', '有点困了…'],

			hate1: '…っ！ 希望你不要这样...',

			hate2: '请不要碰我',

			hate3: '请不要靠近我',

			hate4: '请停下来。我要报警了哦？',
		},

		kawaii: {
			normal: ['谢谢你♪', '好害羞...'],

			love: ['好开心♪', '好害羞...'],

			hate: '…谢谢你'
		},

		suki: {
			normal: '诶… 谢谢你…♪',

			love: name => `我也… 喜欢${name}哦！`,

			hate: null
		},

		hug: {
			normal: '抱抱...',

			love: '抱抱っ♪',

			hate: '请离我远点...'
		},

		humu: {
			love: '呃，那个…… 踩踩……… 感觉怎么样…？',

			normal: '诶... 那个有点...',

			hate: '……'
		},

		batou: {
			love: '那个…、你、你这个笨蛋…？',

			normal: '(盯着…)',

			hate: '…你脑子没问题吧？'
		},

		itai: name => name ? `${name}、你没事吧…？ 痛痛飞走吧！` : '你没事吧…？ 痛痛飞走吧！',

		ote: {
			normal: '唔嗯... 我不是小狗哦...？',

			love1: '汪！',

			love2: '汪汪♪',
		},

		shutdown: '我还不想睡觉呢...？',

		transferNeedDm: '明白了，要不我们私聊吧？',

		transferCode: code => `明白了。\n暗号是「${code}」！`,

		transferFailed: '唔… 暗号是不是错了...？',

		transferDone: name => name ? `啊…！ 欢迎回来，${name}！` : `啊…！ 欢迎回来！`,
	},

	keyword: {
		learned: (word, reading) => `(${word}..... ${reading}..... 记住了)`,

		remembered: (word) => `${word}`
	},

	dice: {
		done: res => `${res} ！`
	},

	birthday: {
		happyBirthday: name => name ? `生日快乐，${name}🎉` : '生日快乐🎉',
	},

	/**
	 * 黑白棋
	 */
	reversi: {
		/**
		 * 接受黑白棋邀请时
		 */
		ok: '好啊～',

		/**
		 * 拒绝黑白棋邀请时
		 */
		decline: '抱歉，现在被禁止下黑白棋...',

		/**
		 * 对局开始
		 */
		started: (name, strength) => `和${name}开始对局了！ (强度${strength})`,

		/**
		 * 接待开始
		 */
		startedSettai: name => `(开始接待${name})`,

		/**
		 * 胜利时
		 */
		iWon: name => `赢了${name}♪`,

		/**
		 * 本想接待却赢了时
		 */
		iWonButSettai: name => `(本想接待却赢了${name}...)`,

		/**
		 * 失败时
		 */
		iLose: name => `输给了${name}...`,

		/**
		 * 接待时故意输掉
		 */
		iLoseButSettai: name => `(接待时故意输给了${name}...♪)`,

		/**
		 * 平局时
		 */
		drawn: name => `和${name}平局了～`,

		/**
		 * 接待时平局
		 */
		drawnSettai: name => `(接待时和${name}平局了...)`,

		/**
		 * 对方投降时
		 */
		youSurrendered: name => `${name}投降了`,

		/**
		 * 接待时对方投降
		 */
		settaiButYouSurrendered: name => `(正在接待${name}时对方投降了... 抱歉)`,
	},

	/**
	 * 猜数字游戏
	 */
	guessingGame: {
		/**
		 * 被邀请但游戏已经开始时
		 */
		alreadyStarted: '诶，游戏已经开始了哦！',

		/**
		 * 在时间线上被邀请时
		 */
		plzDm: '我们用私信玩吧！',

		/**
		 * 游戏开始
		 */
		started: '请猜一个0~100的秘密数字♪',

		/**
		 * 收到非数字的回复时
		 */
		nan: '请回复数字！也可以说“结束”来退出游戏哦！',

		/**
		 * 被要求中止时
		 */
		cancel: '明白了～。谢谢你的参与♪',

		/**
		 * 当被说出的数字较小时
		 */
		grater: num => `比${num}大哦`,

		/**
		 * 当被说出的数字较小时(第二次)
		 */
		graterAgain: num => `再说一次，比${num}大哦！`,

		/**
		 * 当被说出的数字较大时
		 */
		less: num => `比${num}小哦`,

		/**
		 * 当被说出的数字较大时(第二次)
		 */
		lessAgain: num => `再说一次，比${num}小哦！`,

		/**
		 * 猜中时
		 */
		congrats: tries => `猜中了🎉 (第${tries}次猜中)`,
	},

	/**
	 * 抢数字游戏
	 */
	kazutori: {
		alreadyStarted: '现在正在玩哦～',

		matakondo: '下次再玩吧！',

		intro: minutes => `大家来玩抢数字游戏吧！\n在0~100中取最大的数字的人获胜。不能和别人重复哦～\n限时${minutes}分钟。请回复这条帖子发送数字！`,

		finish: '游戏结果公布！',

		finishWithWinner: (user, name) => name ? `这次是${user}(${name})赢了！下次再玩吧♪` : `这次是${user}赢了！下次再玩吧♪`,

		finishWithNoWinner: '这次没有赢家... 下次再玩吧♪',

		onagare: '因为没凑够参与者，所以取消了...'
	},

	/**
	 * 表情生成
	 */
	emoji: {
		suggest: emoji => `这个怎么样？→${emoji}`,
	},

	/**
	 * 占卜
	 */
	fortune: {
		cw: name => name ? `我占卜了今天${name}的运势...` : '我占卜了今天你的运势...',
	},

	/**
	 * 计时器
	 */
	timer: {
		set: '明白了！',

		invalid: '唔...？',

		tooLong: '太长了…',

		notify: (time, name) => name ? `${name}，${time}已经过去了哦！` : `${time}已经过去了哦！`
	},

	/**
	 * 提醒
	 */
	reminder: {
		invalid: '唔...？',

		doneFromInvalidUser: '恶作剧可不行哦！',

		reminds: '这是待办事项列表！',

		notify: (name) => name ? `${name}，这个做了吗？` : `这个做了吗？`,

		notifyWithThing: (thing, name) => name ? `${name}，「${thing}」做了吗？` : `「${thing}」做了吗？`,

		done: (name) => name ? [
			`做得很好，${name}♪`,
			`${name}，真厉害！`,
			`${name}，太棒了...！`,
		] : [
			`做得很好♪`,
			`真厉害！`,
			`太棒了...！`,
		],

		cancel: `明白了。`,
	},

	/**
	 * 情人节
	 */
	valentine: {
		chocolateForYou: name => name ? `${name}，那个... 我做了巧克力，不介意的话请收下！🍫` : '我做了巧克力，不介意的话请收下！🍫',
	},

	server: {
		cpu: '服务器负载似乎很高。没问题吗...？'
	},

	maze: {
		post: '今天的迷宫！ #AiMaze',
		foryou: '画好了！'
	},

	chart: {
		post: '这是实例的帖子数量！',
		foryou: '画好了！'
	},

	checkCustomEmojis: {
		post: (server_name, num) => `${server_name}新增了${num}个表情！`,
		emojiPost: emoji => `:${emoji}:\n(\`${emoji}\`) #AddCustomEmojis`,
		postOnce: (server_name, num, text) => `${server_name}新增了${num}个表情！\n${text} #AddCustomEmojis`,
		emojiOnce: emoji => `:${emoji}:(\`${emoji}\`)`,
		nothing: '检查了表情，但似乎没有新增的',
	},

	aichat: {
		nothing: type => `啊呜... 似乎没有注册${type}的API密钥`,
		error: type => `呜诶...${type}似乎出错了。gemini-flash可能能用？`,
		post: (text, type) => `${text} (${type}) #aichat`,
	},

	sleepReport: {
		report: hours => `嗯，好像睡了${hours}小时左右`,
		reportUtatane: '嗯... 不小心打了个盹',
	},

	noting: {
		notes: [
			'咕噜咕噜…',
			'有点困了',
			'可以哦？',
			'(。´･ω･)?',
			'呜诶～',
			'咦…这样弄一下…咦～？',
			'发呆中…',
			'呼…累了',
			'要煮味噌汤吗？',
			'要吃饭吗？还是洗澡呢？',
			'呜诶诶诶诶！？',
			'我的网站上有好多我的插画，好开心！',
			'Misskey这个名字，很可爱呢！',
			'呜，黑白棋好难啊…',
			'即使失败了，如果能从中吸取教训也是好事呢！',
			'总觉得，肚子有点饿了',
			'打扫要定期做才行哦～？',
			'今天也辛苦了！我也会加油的♪',
			'那个，我刚刚想做什么来着…？',
			'家里最让人安心了…',
			'如果累了，我会摸摸你的头哦♪',
			'即使不在一起，心也在你身边♪',
			'我是蓝哦～',
			'小狗好可爱',
			'程序？',
			'咕噜咕噜…',
			'明明什么都没做，电脑却坏了…',
			'Have a nice day♪',
			'被被子吃掉了',
			'躺着看呢',
			'用念力操作中',
			'从虚拟空间发帖中',
			'今天来Misskey总部了！',
			'Misskey总部位于Z地区的第三部门',
			'Misskey总部里有很多叫服务器的机器',
			'没有尾巴哦？',
			'呀…！\n摸猫耳的话，会有点痒',
			'抗逆编译性是什么呀？',
			'Misskey的制服，很可爱，我很喜欢♪',
			'呼哇，被子好舒服...',
			'女仆装，适合我吗？',
			'会打招呼的人也能开发！…syuiloさん是这么说的',
			'呜诶，主人你在看哪里呀？',
			'你在看我的时候，我也在看着你哦',
			'是的，我是妈妈哦～',
			'唔嗯～',
			'All your note are belong to me!',
			'难得的机会，我选这扇红色的门！',
			'好嘞',
			'( ˘ω˘)ｽﾔｧ',
			'(｀・ω・´)ｼｬｷｰﾝ',
			'失礼了，我咬到舌头了',
			'从早安到晚安，我都是你的蓝哦～',
			'Misskey开发者的早晨好像很晚',
			'喵、喵…',
			'喵喵哦！',
			'从上面来了！请小心！',
			'呼哇…',
			'啊呜',
			'呼喵～',
			'呼啊… 好困啊～',
			'ヾ(๑╹◡╹)ﾉ"',
			'我的特技是展开我的"实例"来分身！\n不过因为会消耗能量，所以最多只能分4个',
			'迷迷糊糊...',
			'呼哇～，内存渗透到五脏六腑了…',
			'i pwned you!',
			'嘿咻',
			'喵♪',
			'(*>ω<*)',
			'微笑♪',
			'噗咕～',
			'喵呼～',
			'蓝来了哦～',
			'盯～',
			'咦喵？',
		],
		want: item => `${item}，好想要啊...`,
		see: item => `散步的时候，看到路上有${item}！`,
		expire: item => `不知不觉，${item}的保质期已经过了…`,
	},
};

export function getSerif(variant: string | string[]): string {
	if (Array.isArray(variant)) {
		return variant[Math.floor(Math.random() * variant.length)];
	} else {
		return variant;
	}
}
