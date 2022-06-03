import {ContextMenuOption} from "hooks/useContextMenu";
import binIcon from "assets/bin.svg";
import downloadIcon from "assets/download.svg";
import shareIcon from "assets/share.svg";
import moveToIcon from "assets/moveTo.svg";
import renameIcon from "assets/rename.svg";
import previewIcon from "assets/eye.svg";
import createFolderIcon from "assets/add-folder.svg";
import uploadFolderIcon from "assets/upload-folder.svg";
import uploadFileIcon from "assets/upload-file.svg";
import reloadIcon from "assets/reload.svg";
import fireIcon from "assets/fire.svg";
import infoIcon from "assets/info.svg";

export enum EContextMenuTypes {
	FILE,
	VIEW_ONLY_FILE,
	FOLDER,
	VIEW_ONLY_FOLDER,
	CREATE,
	DELETED
}

const contextMenuOptionFactory = (type: EContextMenuTypes, data: { [key: string]: any }): ContextMenuOption[] | null => {
	const entryActions: ContextMenuOption[] = [
		{name: "Share", icon: shareIcon, callback: data.onShare},
		{name: "Rename", icon: renameIcon, callback: data.onRename},
		{name: "Move to", icon: moveToIcon, callback: data.onMoveTo},
		"BR",
		{name: "Download", icon: downloadIcon, callback: data.onDownload},
		{name: "Delete", icon: binIcon, callback: data.onDelete},
	];

	switch (type) {
		case EContextMenuTypes.FILE:
			if (data.onPreview) entryActions.unshift(
				{name: "Preview", icon: previewIcon, callback: data.onPreview},
				"BR",
			);

			return entryActions;
		case EContextMenuTypes.VIEW_ONLY_FILE:
			const actions = [{name: "Download", icon: downloadIcon, callback: data.onDownload}];
			if (data.onPreview) actions.unshift({name: "Preview", icon: previewIcon, callback: data.onPreview});

			return actions;
		case EContextMenuTypes.FOLDER:
			return entryActions;
		case EContextMenuTypes.VIEW_ONLY_FOLDER:
			return [{name: "Download", icon: downloadIcon, callback: data.onDownload}];
		case EContextMenuTypes.CREATE:
			return [
				{name: "New folder", icon: createFolderIcon, callback: data.onNewFolder},
				{name: "Upload folder", icon: uploadFolderIcon, callback: data.onUploadFolder},
				{name: "Upload files", icon: uploadFileIcon, callback: data.onUploadFile},
			];
		case EContextMenuTypes.DELETED:
			return [
				{name: "Info", icon: infoIcon, callback: data.onInfo},
				"BR",
				{name: "Restore file", icon: reloadIcon, callback: data.onRestore},
				{name: "Fully delete", icon: fireIcon, callback: data.onFullyDelete},
			];
		default:
			return null;
	}
};

export default contextMenuOptionFactory;