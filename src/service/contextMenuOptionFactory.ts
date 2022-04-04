import {ContextMenuOption} from "../components/ContextMenu";
import binIcon from "../assets/bin.svg";
import downloadIcon from "../assets/download.svg";
import shareIcon from "../assets/share.svg";
import linkIcon from "../assets/link.svg";
import moveToIcon from "../assets/moveTo.svg";
import renameIcon from "../assets/rename.svg";
import previewIcon from "../assets/eye.svg";

export enum EContextMenuOptions {
	"FILE"
}

const contextMenuOptionFactory = (type: EContextMenuOptions, data: { [key: string]: any }): ContextMenuOption[] | null => {
	switch (type) {
		case EContextMenuOptions.FILE:
			return [
				...(data.onPreview ? [
					{name: "Preview", icon: previewIcon, callback: data.onPreview},
					{name: "BR", icon: "", callback: () => {}},
				] : []),
				{name: "Share", icon: shareIcon, callback: data.onShare},
				{name: "Get link", icon: linkIcon, callback: data.onGetLink},
				{name: "Move to", icon: moveToIcon, callback: data.onMoveTo},
				{name: "Rename", icon: renameIcon, callback: data.onRename},
				{name: "BR", icon: "", callback: () => {}},
				{name: "Download", icon: downloadIcon, callback: data.onDownload},
				{name: "Delete", icon: binIcon, callback: data.onDelete},
			];
		default:
			return null;
	}
};

export default contextMenuOptionFactory;