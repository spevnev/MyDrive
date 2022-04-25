export type SimpleFileEntry = {
	name: string;
	size: number;
}

export type FileEntry = SimpleFileEntry & {
	path: string | null;
	is_directory: boolean;
}

export const filesToEntries = (files: FileList | File[]): SimpleFileEntry[] => {
	const entries: SimpleFileEntry[] = [];

	for (let i = 0; i < files.length; i++) {
		const {size, name} = files[i];
		entries.push({size, name});
	}

	return entries;
};

export const folderToEntries = (files: FileList | File[]): FileEntry[] => {
	const entries: FileEntry[] = [];
	const entry_paths = new Set<string>();

	for (let i = 0; i < files.length; i++) {
		const {webkitRelativePath: path, size, name} = files[i];
		if (entry_paths.has(path)) continue;

		const pathEntries = path.split("/").slice(0, -1);
		let curPath = pathEntries.join("/");
		for (let j = 0; j < pathEntries.length; j++) {
			if (j > 0) curPath = curPath.split("/").slice(0, -1 * j).join("/");
			if (!curPath || entry_paths.has(curPath)) continue;

			const curPathEntries = curPath.split("/");
			const name = curPathEntries.slice(-1)[0];

			entries.push({path: curPath.split("/").slice(0, -1).join("/"), size: 0, is_directory: true, name});
			entry_paths.add(curPath);
		}

		entries.push({path: path.split("/").slice(0, -1).join("/"), size, name, is_directory: false});
		entry_paths.add(path);
	}

	return entries;
};


const getFiles = (file: FileSystemEntry, path?: string): Promise<File[]> => new Promise(resolve => {
	if (file.isFile) {
		(file as FileSystemFileEntry).file(file => resolve([file]));
		return;
	}

	(file as FileSystemDirectoryEntry).createReader().readEntries(async entries => {
		const files: File[] = [];

		for (let i = 0; i < entries.length; i++) {
			const newPath = `${path}/${entries[i].name}`;
			const newFiles = (await getFiles(entries[i], newPath)).map(({webkitRelativePath, name, type, size}) => ({
				webkitRelativePath: webkitRelativePath || `${path}/${name}`,
				name,
				type,
				size,
			})) as File[];
			files.push(...newFiles);
		}

		resolve(files);
	});
});

export const dataTransferToEntries = async (fileList: DataTransferItemList): Promise<{ simpleFileEntries?: SimpleFileEntry[], fileEntries?: FileEntry[] }> => {
	let containsFolders = false;
	for (let i = 0; i < fileList.length; i++) {
		const file = fileList[i].webkitGetAsEntry();
		if (!file) continue;

		if (file.isDirectory) {
			containsFolders = true;
			break;
		}
	}

	if (!containsFolders) {
		const files: Promise<File>[] = [];

		for (let i = 0; i < fileList.length; i++) {
			const file = fileList[i].webkitGetAsEntry();
			if (!file) continue;

			files.push(new Promise(resolve => (file as FileSystemFileEntry).file(file => resolve(file))));
		}

		return {simpleFileEntries: filesToEntries(await Promise.all(files))};
	}

	const files: File[] = [];

	for (let i = 0; i < fileList.length; i++) {
		const file = fileList[i].webkitGetAsEntry();
		if (file) files.push(...(await getFiles(file, file.name)));
	}

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