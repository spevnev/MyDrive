import {EFileType} from "../pages/main/Category/File";

const extensionToType: [string[], EFileType][] = [
	[["xlsl", "xls", "xlsm", "xlsx"], EFileType.EXCEL],
	[["doc", "docx"], EFileType.WORD],
	[["pdf"], EFileType.PDF],
	[["zip", "7z", "rar", "pkg", "gz"], EFileType.COMPRESSED],
	[["txt"], EFileType.TEXT],
	[["png", "jpg", "jpeg", "svg", "gif", "ico"], EFileType.IMAGE],
	[["mp4", "avi", "h264", "mkv", "mov", "mpg"], EFileType.VIDEO],
	[["mp3", "ogg", "wav"], EFileType.MUSIC],
];

export const getFileType = (extension: string): EFileType => {
	for (let i = 0; i < extensionToType.length; i++) {
		const [extensions, type] = extensionToType[i];
		if (extensions.includes(extension)) return type;
	}

	return EFileType.OTHER;
};