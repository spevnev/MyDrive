import {ContextMenuOption} from "hooks/useContextMenu";
import binIcon from "assets/bin.svg";
import downloadIcon from "assets/download.svg";
import shareIcon from "assets/share.svg";
import linkIcon from "assets/link.svg";
import moveToIcon from "assets/moveTo.svg";
import renameIcon from "assets/rename.svg";
import previewIcon from "assets/eye.svg";
import createFolderIcon from "assets/add-folder.svg";
import uploadFolderIcon from "assets/upload-folder.svg";
import uploadFileIcon from "assets/upload-file.svg";

export enum EContextMenuTypes {
	FILE,
	FOLDER,
	CREATE
}

const contextMenuOptionFactory = (type: EContextMenuTypes, data: { [key: string]: any }): ContextMenuOption[] | null => {
	const defaultContextMenu = [
		{name: "Share", icon: shareIcon, callback: data.onShare},
		{name: "Get link", icon: linkIcon, callback: data.onGetLink},
		{name: "Move to", icon: moveToIcon, callback: data.onMoveTo},
		{name: "Rename", icon: renameIcon, callback: data.onRename},
		{name: "BR", icon: "", callback: () => {}},
		{name: "Download", icon: downloadIcon, callback: data.onDownload},
		{name: "Delete", icon: binIcon, callback: data.onDelete},
	];

	switch (type) {
		case EContextMenuTypes.FILE:
			return [
				...(data.onPreview ? [
					{name: "Preview", icon: previewIcon, callback: data.onPreview},
					{name: "BR", icon: "", callback: () => {}},
				] : []),
				...defaultContextMenu,
			];
		case EContextMenuTypes.FOLDER:
			return defaultContextMenu;
		case EContextMenuTypes.CREATE:
			return [
				{name: "New folder", icon: createFolderIcon, callback: data.onNewFolder},
				{name: "Upload folder", icon: uploadFolderIcon, callback: data.onUploadFolder},
				{name: "Upload file", icon: uploadFileIcon, callback: data.onUploadFile},
			];
		default:
			return null;
	}
};

export default contextMenuOptionFactory;