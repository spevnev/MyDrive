export type SimpleFileEntry = {
	name: string;
	size: number;
}

export type FileEntry = SimpleFileEntry & {
	path: string | null;
	is_directory: boolean;
}

export const filesToEntry = (files: FileList): SimpleFileEntry[] => {
	const entries: SimpleFileEntry[] = [];

	for (let i = 0; i < files.length; i++) {
		const {size, name} = files[i];
		entries.push({size, name});
	}

	return entries;
};

export const folderToEntries = (files: FileList): FileEntry[] => {
	const entries: FileEntry[] = [];
	const entry_paths = new Set<string>();

	for (let i = 0; i < files.length; i++) {
		const {webkitRelativePath: path, size, name} = files[i];
		if (entry_paths.has(path)) continue;

		const pathEntries = path.split("/").slice(0, -1);
		let curPath = pathEntries.join("/");
		for (let j = 0; j < pathEntries.length; j++) {
			if (j > 0) curPath = curPath.split("/").slice(0, -1 * j).join("/");
			if (entry_paths.has(curPath)) continue;

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