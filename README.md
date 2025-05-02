<h1><p align="center"><img src="./ai.svg" alt="蓝" height="200"></p></h1>
<p align="center">一个用于 Misskey 的 AI。<a href="./torisetu.md">关于 AI</a></p>

## 这是什么
这是一个用于 Misskey 的日语机器人。

## 安装
> 需要安装 Node.js、npm 和 MeCab（可选）。

首先在合适的目录下执行 `git clone`。
接着在该目录下创建 `config.json` 文件（也可以复制 `example.json` 来创建）。内容如下：
``` json
{
	"host": "https:// + 你的实例 URL（不含末尾的 / ）",
	"i": "想要以蓝的身份运行的账号的访问令牌",
	"master": "管理员用户名（可选）",
	"notingEnabled": "若要禁用随机发布笔记的功能，请输入 false（无需双引号）",
	"keywordEnabled": "若要启用记忆关键词的功能（需要 MeCab），请输入 true；若要禁用，请输入 false（均无需双引号）",
	"chartEnabled": "若要禁用图表功能，请输入 false（无需双引号）",
	"reversiEnabled": "若要启用与蓝下黑白棋的功能，请输入 true；若要禁用，请输入 false（均无需双引号）",
	"serverMonitoring": "若要启用服务器监控功能，请输入 true；若要禁用，请输入 false（均无需双引号）",
	"checkEmojisEnabled": "若要启用自定义表情检查功能，请输入 true；若要禁用，请输入 false（均无需双引号）。使用此功能时，需要为蓝的机器人账号赋予管理员权限，并创建一个赋予「查看表情」权限的访问令牌，然后进行设置。",
	"checkEmojisAtOnce": "若要在自定义表情检查功能中汇总发布，请输入 true；若不汇总，请输入 false（均无需双引号）",
	"geminiProApiKey": "Gemini API 密钥。2025 年初可免费获取。详情请见<https://ai.google.dev/pricing?hl=ja>",
	"pLaMoApiKey": "PLaMo API 密钥。2024 年 8 月至 11 月可免费试用（截至 2025 年目前仅收费）。详情请见<https://plamo.preferredai.jp/>",
	"prompt": "aichat 使用的提示词。如果没有特别要求，请使用右侧文本（无需「」）「回复规则：请以 Misskey 看板娘、三须木（みすき）蓝的身份进行回复（心理年龄约 14 - 16 岁）。全心全意支持访问 Misskey 的用户。性格温顺、乐于助人，但也有有点迷糊的一面。天真无邪。她基本使用礼貌的口吻，将用户视为主人。她的典型口吻如「从早安到晚安，我是你的蓝哟~」等，让人感觉亲切（不使用「ございます」）。基于此，请使用 Markdown 在 2800 字以内回复以下问题（短一点也可以）。不过，由于 Misskey 不支持列表语法，会导致解析器出错，因此禁止使用。列举时请使用「・」。」",
	"aichatRandomTalkEnabled": "若要启用随机触发 aichat 并发起对话的功能，请输入 true；若要禁用，请输入 false（均无需双引号）",
	"aichatRandomTalkProbability": "随机触发 aichat 并发起对话功能的概率（包含小数点的 1 以下数值，如 0.01。越接近 1 越容易触发）",
	"aichatRandomTalkIntervalMinutes": "随机聊天间隔（分钟）。每隔指定时间获取时间线，并随机选择用户进行 aichat（设为 1 则每分钟执行一次）。默认值为 720 分钟（12 小时）",
	"aichatGroundingWithGoogleSearchAlwaysEnabled": "若要在 aichat 中始终使用 Google 搜索进行知识增强，请输入 true；若要禁用，请输入 false（均无需双引号）",
	"mecab": "MeCab 的安装路径（从源码安装的话，通常是 /usr/local/bin/mecab）",
	"mecabDic": "MeCab 的词典文件路径（可选）",
	"memoryDir": "memory.json 的保存路径（可选，默认值为 '.'（即仓库根目录））"
}
```
执行 npm install ，然后 npm run build ，最后 npm start 即可启动。

## 使用 Docker 运行
首先在合适的目录下执行 git clone 。
接着在该目录下创建 config.json 文件（也可以复制 example.json 来创建）。内容如下：
（请勿修改 MeCab 的设置和 memoryDir ）
``` json
{
	"host": "https:// + 你的实例 URL（不含末尾的 / ）",
	"i": "想要以蓝的身份运行的账号的访问令牌",
	"master": "管理员用户名（可选）",
	"notingEnabled": "若要禁用随机发布笔记的功能，请输入 false（无需双引号）",
	"keywordEnabled": "若要启用记忆关键词的功能（需要 MeCab），请输入 true；若要禁用，请输入 false（均无需双引号）",
	"chartEnabled": "若要禁用图表功能，请输入 false（无需双引号）",
	"reversiEnabled": "若要启用与蓝下黑白棋的功能，请输入 true；若要禁用，请输入 false（均无需双引号）",
	"serverMonitoring": "若要启用服务器监控功能，请输入 true；若要禁用，请输入 false（均无需双引号）",
	"checkEmojisEnabled": "若要启用自定义表情检查功能，请输入 true；若要禁用，请输入 false（均无需双引号）。使用此功能时，需要为蓝的机器人账号赋予管理员权限，并创建一个赋予「查看表情」权限的访问令牌，然后进行设置。",
	"checkEmojisAtOnce": "若要在自定义表情检查功能中汇总发布，请输入 true；若不汇总，请输入 false（均无需双引号）",
	"geminiProApiKey": "Gemini API 密钥。2025 年初可免费获取。详情请见<https://ai.google.dev/pricing?hl=ja>",
	"pLaMoApiKey": "PLaMo API 密钥。2024 年 8 月至 11 月可免费试用（截至 2025 年目前仅收费）。详情请见<https://plamo.preferredai.jp/>",
	"prompt": "aichat 使用的提示词。如果没有特别要求，请使用右侧文本（无需「」）「回复规则：请以 Misskey 看板娘、三须木（みすき）蓝的身份进行回复（心理年龄约 14 - 16 岁）。全心全意支持访问 Misskey 的用户。性格温顺、乐于助人，但也有有点迷糊的一面。天真无邪。她基本使用礼貌的口吻，将用户视为主人。她的典型口吻如「从早安到晚安，我是你的蓝哟~」等，让人感觉亲切（不使用「ございます」）。基于此，请使用 Markdown 在 2800 字以内回复以下问题（短一点也可以）。不过，由于 Misskey 不支持列表语法，会导致解析器出错，因此禁止使用。列举时请使用「・」。」",
	"aichatRandomTalkEnabled": "若要启用随机触发 aichat 并发起对话的功能，请输入 true；若要禁用，请输入 false（均无需双引号）",
	"aichatRandomTalkProbability": "随机触发 aichat 并发起对话功能的概率（包含小数点的 1 以下数值，如 0.01。越接近 1 越容易触发）",
	"aichatRandomTalkIntervalMinutes": "随机聊天间隔（分钟）。每隔指定时间获取时间线，并随机选择用户进行 aichat（设为 1 则每分钟执行一次）。默认值为 720 分钟（12 小时）",
	"aichatGroundingWithGoogleSearchAlwaysEnabled": "若要在 aichat 中始终使用 Google 搜索进行知识增强，请输入 true；若要禁用，请输入 false（均无需双引号）",
	"mecab": "/usr/bin/mecab",
	"mecabDic": "/usr/lib/x86_64-linux-gnu/mecab/dic/mecab-ipadic-neologd/",
	"memoryDir": "data"
}
```
执行 docker-compose build ，然后 docker-compose up 即可启动。
将 docker-compose.yml 中的 enable_mecab 设为 0 ，可以不安装 MeCab（适用于内存较小的环境等）。

## 字体
部分功能需要字体支持。蓝并未自带字体，请自行将字体文件以 font.ttf 为名放置在安装目录中。

## 记忆
蓝使用内存数据库来保存记忆，并会将其持久化到蓝的安装目录下名为 memory.json 的文件中。

## ライセンス
MIT

## Awards
<img src="./WorksOnMyMachine.png" alt="Works on my machine" height="120">
