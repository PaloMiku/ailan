import { hankakuToZenkaku, katakanaToHiragana } from './japanese.js';

export default function(text: string, words: (string | RegExp)[]): boolean {
	if (text == null) return false;

	text = katakanaToHiragana(hankakuToZenkaku(text));
	words = words.map(word => typeof word == 'string' ? katakanaToHiragana(word) : word);

	return words.some(word => {
		/**
			* 删除文本的多余部分
			* 例如，将 “I like Ai-chan！” 等文本更改为 “like”
		 */
		function denoise(text: string): string {
			text = text.trim();

			if (text.startsWith('@')) {
				text = text.replace(/^@[a-zA-Z0-1\-_]+/, '');
				text = text.trim();
			}

			function fn() {
				text = text.replace(/[！!]+$/, '');
				text = text.replace(/っ+$/, '');

				// 删除尾部 ー
				// 例如，将 “おはよー” 改为 “おはよ”
				// 但是，如果按原样作，则原本包含“ー”的单词（如“セーラー”）也会删除“ー”
				// 它将变为 “セーラ”，如果您期待的是 “セーラー”，它不会匹配，也不会按预期运行，因此
				// 如果预期的单词原来末尾包含 “ー”，请在删除目标文本中的所有 “ー” 后添加 “ー”。
				text = text.replace(/ー+$/, '') + ((typeof word == 'string' && word[word.length - 1] == 'ー') ? 'ー' : '');

				text = text.replace(/。$/, '');
				text = text.replace(/です$/, '');
				text = text.replace(/(\.|…)+$/, '');
				text = text.replace(/[♪♥]+$/, '');
				text = text.replace(/^蓝/, '');
				text = text.replace(/^ちゃん/, '');
				text = text.replace(/、+$/, '');
			}

			let textBefore = text;
			let textAfter: string | null = null;

			while (textBefore != textAfter) {
				textBefore = text;
				fn();
				textAfter = text;
			}

			return text;
		}

		if (typeof word == 'string') {
			return (text == word) || (denoise(text) == word);
		} else {
			return (word.test(text)) || (word.test(denoise(text)));
		}
	});
}

