import {ContextMenuOption} from "hooks/useContextMenu";
import binIcon from "assets/bin.svg";
import downloadIcon from "assets/download.svg";
import shareIcon from "assets/users.svg";
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
	const entryActions = [
		{name: "Share", icon: shareIcon, callback: data.onShare},
		{name: "Rename", icon: renameIcon, callback: data.onRename},
		{name: "Move to", icon: moveToIcon, callback: data.onMoveTo},
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
				...entryActions,
			];
		case EContextMenuTypes.FOLDER:
			return entryActions;
		case EContextMenuTypes.CREATE:
			return [
				{name: "New folder", icon: createFolderIcon, callback: data.onNewFolder},
				{name: "Upload folder", icon: uploadFolderIcon, callback: data.onUploadFolder},
				{name: "Upload files", icon: uploadFileIcon, callback: data.onUploadFile},
			];
		default:
			return null;
	}
};

export default contextMenuOptionFactory;