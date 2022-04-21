export type SimpleFileEntry = {
	name: string;
	size: number;
}

export type FileEntry = SimpleFileEntry & {
	path: string | null;
	is_directory: boolean;
}

export const filesToEntry = (files: FileList | File[]): SimpleFileEntry[] => {
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

		if (name !== ".DS_Store") entries.push({path: path.split("/").slice(0, -1).join("/"), size, name, is_directory: false});
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

		return {simpleFileEntries: filesToEntry(await Promise.all(files))};
	}

	const files: File[] = [];

	for (let i = 0; i < fileList.length; i++) {
		const file = fileList[i].webkitGetAsEntry();
		if (file) files.push(...(await getFiles(file, file.name)));
	}

	return {fileEntries: folderToEntries(files)};
};