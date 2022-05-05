import {Folder, FolderArrayElement} from "./fileTypes";

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