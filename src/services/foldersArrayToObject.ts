export type Folder = {
	name: string;
	children: Folder[];
}

export type FolderArrayElement = {
	name: string;
	id: number;
	parent_id: number;
}

export const foldersArrayToObject = (arr: FolderArrayElement[]): Folder[] => {
	if (arr.length === 0) return [];

	const idToFolder = new Map<number, Folder>();
	arr.forEach(({name, id}) => idToFolder.set(id, {name: name, children: []} as Folder));

	return arr.map(el => {
		const cur = idToFolder.get(el.id);
		if (!cur) return null;

		if (!idToFolder.has(el.parent_id)) return cur;

		const parent = idToFolder.get(el.parent_id);
		if (parent && cur) parent.children.push(cur);

		return null;
	}).filter(cur => cur !== null) as Folder[];
};