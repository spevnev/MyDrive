import {BinData} from "../../pages/main";

export type FolderArrayElement = {
	name: string;
	id: number;
	parent_id: number;
	share_id: number | null;
	username?: string;
	bin_data: BinData | null;
}

export type Folder = {
	name: string;
	children: Folder[];
	share_id: number | null;
	username?: string;
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

export type FileSystemHandle = {
	kind: string;
	name: string;

	getFile: () => Promise<File>;
	values: () => Promise<Iterator<any>>
};