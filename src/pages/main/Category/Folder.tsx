import React, {MouseEvent, useContext} from "react";
import folderImage from "assets/folder.svg";
import {ContextMenuContext, Entry} from "../index";
import {EContextMenuTypes} from "helpers/contextMenuOptionFactory";
import {Container, Image, Name} from "./Folder.styles";
import {useNavigate} from "react-router-dom";
import Spinner from "components/Spinner";
import {EntryActionsContext} from "../FileExplorer";

type FolderProps = {
	entry: Entry;
	isSelected: boolean;
	onClick: (e: MouseEvent) => void;
	isLoading: boolean;
}

const Folder = ({entry, isSelected, onClick, isLoading}: FolderProps) => {
	const {openContextMenu} = useContext(ContextMenuContext);
	const {onDelete, onDownload, onRename, onShare, onMoveTo} = useContext(EntryActionsContext);

	const navigate = useNavigate();


	const onContextMenu = (e: MouseEvent) => {
		const contextMenuData: object = {onDelete, onDownload, onRename, onShare: () => onShare(entry), onMoveTo: () => onMoveTo(entry)};
		openContextMenu(e, contextMenuData, EContextMenuTypes.FOLDER);
	};

	const onDoubleClick = () => navigate(`${document.location.pathname}${document.location.hash + "/" + entry.name}`);


	return (
		<Container className={isSelected ? "selected" : ""} onContextMenuCapture={onContextMenu} onClick={onClick} onDoubleClick={onDoubleClick}>
			{isLoading ? <Spinner size={32}/> : <Image src={folderImage}/>}
			<Name>{entry.name}</Name>
		</Container>
	);
};

export default Folder;