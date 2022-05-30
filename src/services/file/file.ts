import {FileEntry, FileSystemHandle, Folder, FolderArrayElement, SimpleFileEntry} from "./fileTypes";
import {getData} from "../token";

export const foldersArrayToObject = (arr: FolderArrayElement[]): Folder[] => {
	if (arr.length === 0) return [];

	const idToFolder = new Map<number, Folder>();
	arr.forEach(({name, id, share_id, username}) => idToFolder.set(id, {name: name, children: [], share_id, username} as Folder));

	return arr.map(el => {
		const cur = idToFolder.get(el.id);
		if (!cur) return null;

		if (!idToFolder.has(el.parent_id)) return cur;

		const parent = idToFolder.get(el.parent_id);
		if (!parent) return null;
		if (parent.share_id !== cur.share_id) return cur;

		parent.children.push(cur);
		return null;
	}).filter(cur => cur !== null) as Folder[];
};

export const groupFoldersByUsername = (folders: Folder[]): Folder[] => {
	const usernames = new Set<string>();
	folders.forEach(({username}) => username && usernames.add(username));

	const usernameToFolder = new Map<string, Folder>();
	[...usernames].forEach(username => usernameToFolder.set(username, {name: username, children: [], share_id: null}));

	folders.forEach(folder => {
		if (folder.username === undefined) return;
		usernameToFolder.get(folder.username)?.children.push(folder);
	});

	return [...usernameToFolder.values()] as Folder[];
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

export const splitName = (name: string): [string, string | null] => {
	const reverse = (str: string): string => [...str].reverse().join("");

	const cleanName = name.replace(/ \(\d+\)/, "");
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
		if (entry.path) return entry;

		const [filename, extension] = splitName(entry.name);
		const matches = (entry.is_directory ? folderNames : fileNames).matchAll(new RegExp(`${filename}(?: \\((\\d+)\\))?`, "gm"));

		let max = -1;
		while (true) {
			const cur = matches.next();
			if (cur.done) break;

			max = Math.max(max, cur.value[1] ? Number(cur.value[1] || 0) : 0);
		}
		if (max === -1) return entry;

		return {...entry, newName: `${filename} (${max + 1})${extension === null ? "" : extension}`};
	});
};

export const filesToEntries = async (files: File[]): Promise<SimpleFileEntry[]> => {
	const entries: SimpleFileEntry[] = [];

	for (let i = 0; i < files.length; i++) {
		const curFile = files[i];
		const data = await curFile.arrayBuffer();

		entries.push({size: curFile.size, name: curFile.name, data});
	}

	return entries;
};

export const folderToEntries = async (files: File[]): Promise<FileEntry[]> => {
	const entries: FileEntry[] = [];
	const entry_paths = new Set<string>();

	for (let i = 0; i < files.length; i++) {
		const curFile = files[i];
		const {webkitRelativePath: path, size, name} = curFile;
		if (entry_paths.has(path)) continue;
		const data: ArrayBuffer = await curFile.arrayBuffer();

		const pathEntries = path.split("/").slice(0, -1);
		let curPath = pathEntries.join("/");

		entries.push({path: curPath, size, name, is_directory: false, data});
		entry_paths.add(path);

		for (let j = 0; j < pathEntries.length; j++) {
			if (j > 0) curPath = curPath.split("/").slice(0, -1 * j).join("/");
			if (!curPath || entry_paths.has(curPath)) continue;

			const name = curPath.split("/").slice(-1)[0];
			entries.push({path: curPath.split("/").slice(0, -1).join("/"), size: 0, is_directory: true, name});
			entry_paths.add(curPath);
		}
	}

	return entries;
};

export const dataTransferToEntries = async (itemList: DataTransferItemList): Promise<{ simpleFileEntries?: SimpleFileEntry[], fileEntries?: FileEntry[] }> => {
	const getFiles = async (file: FileSystemHandle, path?: string): Promise<File[]> => {
		if (file.name === ".DS_Store") return [];

		if (file.kind === "file") {
			const curFile: File = await file.getFile();
			const data = await curFile.arrayBuffer();

			return [{
				webkitRelativePath: path,
				name: curFile.name,
				size: curFile.size,
				arrayBuffer: () => Promise.resolve(data),
			} as File];
		}

		const arr: File[] = [];
		const values = await file.values();

		while (true) {
			const {done, value} = await values.next();
			if (done) break;
			arr.push(...await getFiles(value, `${path}/${value.name}`));
		}

		return arr;
	};

	// @ts-ignore
	const handles: FileSystemHandle[] = (await Promise.all([...itemList].map(item => item.getAsFileSystemHandle()))).filter(handle => !!handle);
	if (handles.length === 0) return {};

	const filesPromises = handles.map(handle => getFiles(handle, handle.name));
	const files: File[] = (await Promise.all(filesPromises)).reduce((arr: File[], cur) => [...arr, ...cur], []);

	const containsFolders = handles.filter(({kind}) => kind === "directory").length > 0;
	return containsFolders ? {fileEntries: await folderToEntries(files)} : {simpleFileEntries: await filesToEntries(files)};
};

export const getFolderPath = (arr: FolderArrayElement[], id: number): string | null => {
	let el = arr.filter(el => el.id === id)[0];
	if (!el) return null;

	const path = [];
	const drive_id = getData()?.drive_id;
	while (el.parent_id !== drive_id) {
		path.push(el.name);
		el = arr.filter((cur: FolderArrayElement) => cur.id === el.parent_id)[0];
	}
	path.push(el.name);

	return "/" + path.reverse().join("/");
};

export const getFolderByPath = (arr: FolderArrayElement[], path: string): number | null => {
	const getFolderChildren = (names: string[], id: number, i: number = 1): number | null => {
		if (names.length === i) return id;

		const [next] = arr.filter(el => el.name === names[i] && el.parent_id === id);
		if (!next) return null;

		return getFolderChildren(names, next.id, i + 1);
	};

	if (path[0] === "/") path = path.slice(1);
	const names = path.split("/");

	const start = arr.filter(el => el.name === names[0]);
	if (start.length === 0) return null;

	const startId = start[0].id;
	if (names.length === 1) return startId;
	return getFolderChildren(names, startId);
};