export type FolderArrayElement = {
	name: string;
	id: number;
	parent_id: number;
	share_id: number | null;
}

export type Folder = {
	name: string;
	children: Folder[];
	share_id: number | null;
}

export type SimpleFileEntry = {
	newName?: string;
	data?: ArrayBuffer;
	name: string;
	size: number;
}

export type FileEntry = SimpleFileEntry & {
	path: string | null;
	is_directory: boolean;
}