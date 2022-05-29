import React, {MouseEvent, useContext} from "react";
import folderImage from "assets/folder.svg";
import {BinData, ContextMenuContext, Entry} from "../index";
import {EContextMenuTypes} from "helpers/contextMenuOptionFactory";
import {Container, Image, Name} from "./Folder.styles";
import {useNavigate} from "react-router-dom";
import Spinner from "components/Spinner";
import {EntryActionsContext} from "../FileExplorer/FileExplorer";

type FolderProps = {
	entry: Entry;
	isSelected: boolean;
	onClick: (e: MouseEvent) => void;
	isLoading: boolean;
	binData: BinData | null;
}

const Folder = ({entry, isSelected, onClick, isLoading, binData}: FolderProps) => {
	const {openContextMenu} = useContext(ContextMenuContext);
	const {onDelete, onDownload, onRename, onShare, onMoveTo, onRestore, onInfo, onFullyDelete} = useContext(EntryActionsContext);

	const navigate = useNavigate();


	const onContextMenu = (e: MouseEvent) => {
		if (binData) {
			const contextMenuData: object = {
				onRestore: () => onRestore(entry),
				onInfo: () => onInfo(entry),
				onFullyDelete: () => onFullyDelete(entry),
			};

			openContextMenu(e, contextMenuData, EContextMenuTypes.DELETED);
			return;
		}

		const contextMenuData: object = {
			onDelete: () => onDelete(entry),
			onDownload: () => onDownload(entry),
			onRename: () => onRename(entry),
			onShare: () => onShare(entry),
			onMoveTo: () => onMoveTo(entry),
		};
		openContextMenu(e, contextMenuData, EContextMenuTypes.FOLDER);
	};

	const onDoubleClick = () => {
		if (binData) return;
		navigate(`${document.location.pathname}${document.location.hash + "/" + entry.name}`);
	};


	return (
		<Container className={isSelected ? "selected" : ""} onContextMenuCapture={onContextMenu} onClick={onClick} onDoubleClick={onDoubleClick}>
			{isLoading ? <Spinner size={32}/> : <Image src={folderImage}/>}
			<Name>{entry.name}</Name>
		</Container>
	);
};

export default Folder;