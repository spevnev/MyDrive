export type Node = {
	text: string;
	children: Map<string, Node>;
	isWord: boolean;
}

export class Trie {
	root: Node = {text: "", children: new Map(), isWord: false};
	length: number = 0;

	reset = (): void => {
		this.root = {text: "", children: new Map(), isWord: false};
	};

	has = (string: string): boolean => {
		const chars = string.split("");

		let node: Node = this.root;
		let i = 0;
		// @ts-ignore
		while (node.children.has(chars[i])) node = node.children.get(chars[i++]);

		return node.isWord && node.text === string;
	};

	add = (string: string): void => {
		if (this.has(string)) return;
		const chars = string.split("");

		let node: Node = this.root;
		let i = 0;
		// @ts-ignore
		while (node.children.has(chars[i])) node = node.children.get(chars[i++]);

		while (i < chars.length) {
			const child: Node = {text: node.text + chars[i], children: new Map(), isWord: false};
			node.children.set(chars[i], child);
			node = child;
			i++;
		}
		node.isWord = true;

		this.length++;
	};

	get = (beginning: string, number: number, prioritiseShorterPaths: boolean = false): string[] => {
		if (beginning.length === 0) return [];

		const chars = beginning.split("");
		const results: string[] = [];
		const queue: Node[] = [];

		let node: Node = this.root;
		let i = 0;
		// @ts-ignore
		while (node.children.has(chars[i])) node = node.children.get(chars[i++]);
		if (i !== chars.length) return [];
		queue.push(...node.children.values());

		while (queue.length !== 0 && results.length < number) {
			if (prioritiseShorterPaths) queue.sort((a, b) => a.text.split("/").length - b.text.split("/").length);
			const node = queue.shift();
			if (!node) break;

			if (node.isWord) results.push(node.text);

			queue.push(...node.children.values());
		}

		return results;
	};
}