export type SimpleFileEntry = {
	newName?: string;
	name: string;
	size: number;
}

export type FileEntry = SimpleFileEntry & {
	path: string | null;
	is_directory: boolean;
}

export const filesToEntries = (files: File[]): SimpleFileEntry[] => files.map(({size, name}) => ({size, name}));

export const folderToEntries = (files: File[]): FileEntry[] => {
	const entries: FileEntry[] = [];
	const entry_paths = new Set<string>();

	files.forEach(({webkitRelativePath: path, size, name}) => {
		if (entry_paths.has(path)) return;

		const pathEntries = path.split("/").slice(0, -1);
		let curPath = pathEntries.join("/");

		entries.push({path: curPath, size, name, is_directory: false});
		entry_paths.add(path);

		for (let j = 0; j < pathEntries.length; j++) {
			if (j > 0) curPath = curPath.split("/").slice(0, -1 * j).join("/");
			if (!curPath || entry_paths.has(curPath)) continue;

			const name = curPath.split("/").slice(-1)[0];
			entries.push({path: curPath.split("/").slice(0, -1).join("/"), size: 0, is_directory: true, name});
			entry_paths.add(curPath);
		}
	});

	return entries;
};


const getFiles = (file: FileSystemEntry, path?: string): Promise<File[]> => new Promise(resolve => {
	if (file.isFile) return (file as FileSystemFileEntry).file(file => resolve([file]));

	(file as FileSystemDirectoryEntry).createReader().readEntries(async entries => {
		const files: File[] = [];

		for (let i = 0; i < entries.length; i++) {
			const newPath = `${path}/${entries[i].name}`;
			const childrenFiles = await getFiles(entries[i], newPath);

			files.push(...(childrenFiles.map(file => ({
				webkitRelativePath: file.webkitRelativePath || `${path}/${file.name}`,
				name: file.name,
				type: file.type,
				size: file.size,
			})) as File[]));
		}

		resolve(files);
	});
});

export const dataTransferToEntries = async (fileList: DataTransferItemList): Promise<{ simpleFileEntries?: SimpleFileEntry[], fileEntries?: FileEntry[] }> => {
	const entries: FileSystemEntry[] = [];
	for (let i = 0; i < fileList.length; i++) {
		if (!fileList[i]) continue;
		const entry = fileList[i].webkitGetAsEntry();

		if (!entry) continue;
		entries.push(entry);
	}

	let containsFolders = entries.filter(entry => entry.isDirectory).length > 0;
	if (!containsFolders) {
		const files: Promise<File>[] = entries.map(entry => new Promise(resolve => (entry as FileSystemFileEntry).file(file => resolve(file))));
		return {simpleFileEntries: filesToEntries(await Promise.all(files))};
	}

	const files: File[] = [];
	for (let i = 0; i < entries.length; i++) files.push(...(await getFiles(entries[i], entries[i].name)));
	return {fileEntries: folderToEntries(files)};
};


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


const getPaths = (folder: Folder, path: string = ""): string[] => {
	const newPath = `${path}/${folder.name}`;
	if (folder.children.length === 0) return [path, newPath];

	const childPaths: string[] = folder.children.reduce((arr: string[], child) => [...arr, ...getPaths(child, newPath)], []);
	return [path, ...childPaths];
};

export const foldersArrayToPaths = (arr: FolderArrayElement[]): string[] => {
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
		el = arr.filter(cur => cur.id === el.parent_id)[0];
	}

	return path;
};


const getFolderChildren = (arr: FolderArrayElement[], names: string[], id: number, i: number): number => {
	if (names.length === i) return id;
	const nextId = arr.filter(el => el.name === names[i])[0].id;
	return getFolderChildren(arr, names, nextId, i + 1);
};

export const getFolderByPath = (arr: FolderArrayElement[], path: string): number | null => {
	if (path[0] === "/") path = path.slice(1);
	const names = path.split("/");
	const start = arr.filter(el => el.name === names[0]);
	if (start.length === 0) return null;
	if (names.length === 1) return start[0].id;

	return getFolderChildren(arr, names, start[0].id, 1);
};


const reverse = (str: string): string => [...str].reverse().join("");

const splitName = (name: string): [string, string | null] => {
	const cleanName = name.replace(/ \(\d+\)(\..+)?$/, "");
	const [, ext, filename] = reverse(cleanName).match(/^(\w+\.)?(.+)$/) as [any, string | null, string];

	return [reverse(filename), ext ? reverse(ext) : null];
};

export const renameToAvoidNamingCollisions = (entries: FileEntry[], parentEntries: FileEntry[]): FileEntry[] | SimpleFileEntry[] => {
	let folderNames = "";
	let fileNames = "";
	parentEntries.forEach(cur => {
		if (cur.is_directory) folderNames += cur.name;
		else fileNames += cur.name;
	});

	return entries.map(entry => {
		const matches = (entry.is_directory ? folderNames : fileNames).matchAll(new RegExp(`${entry.name}( \\(([0-9]+)\\))?\\.?`, "g"));
		let max = -1;
		while (true) {
			const cur = matches.next();
			if (cur.done) break;

			max = Math.max(max, cur.value[0] ? Number(cur.value[2] || 0) : -1);
		}
		if (max === -1) return entry;

		const [filename, extension] = splitName(entry.name);
		return {...entry, newName: `${filename} (${max + 1})${extension !== null ? `.${extension}` : ""}`};
	});
};