export type FolderArrayElement = {
	name: string;
	id: number;
	parent_id: number;
}


export type Folder = {
	name: string;
	children: Folder[];
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

export const foldersArrayToPaths = (arr: FolderArrayElement[]): string[] => {
	const getPaths = (folder: Folder, path: string = ""): string[] => {
		const newPath = `${path}/${folder.name}`;
		if (folder.children.length === 0) return [path, newPath];

		const childPaths: string[] = folder.children.reduce((arr: string[], child) => [...arr, ...getPaths(child, newPath)], []);
		return [path, ...childPaths];
	};

	const folders: Folder[] = foldersArrayToObject(arr);
	const pathSet = new Set<string>();

	folders.forEach(folder => getPaths(folder).forEach(value => pathSet.add(value)));

	pathSet.delete("");
	pathSet.add("/");

	return [...pathSet];
};


export const getFolderPath = (arr: FolderArrayElement[], id: number): string | null => {
	let path = "";
	let el = arr.filter(el => el.id === id)[0];
	if (!el) return null;

	while (el.parent_id !== null) {
		path += "/" + el.name;
		el = arr.filter((cur: FolderArrayElement) => cur.id === el.parent_id)[0];
	}

	return path;
};

export const getFolderByPath = (arr: FolderArrayElement[], path: string): number | null => {
	const getFolderChildren = (names: string[], id: number, i: number = 1): number => {
		if (names.length === i) return id;
		const nextId = arr.filter(el => el.name === names[i])[0].id;
		return getFolderChildren(names, nextId, i + 1);
	};

	if (path[0] === "/") path = path.slice(1);
	const names = path.split("/");
	const start = arr.filter(el => el.name === names[0]);
	if (start.length === 0) return null;
	if (names.length === 1) return start[0].id;

	return getFolderChildren(names, start[0].id);
};