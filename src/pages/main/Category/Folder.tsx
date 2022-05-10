import React, {MouseEvent, useContext} from "react";
import folderImage from "assets/folder.svg";
import {ContextMenuContext} from "../index";
import {EContextMenuTypes} from "helpers/contextMenuOptionFactory";
import {Container, Image, Name} from "./Folder.styles";
import {useNavigate} from "react-router-dom";
import Spinner from "../../../components/Spinner";

type FolderProps = {
	name: string;
	isSelected: boolean;
	onClick: (e: MouseEvent) => void;
	isLoading: boolean;
}

const Folder = ({name, isSelected, onClick, isLoading}: FolderProps) => {
	const {openContextMenu}: { [key: string]: Function } = useContext(ContextMenuContext);
	const navigate = useNavigate();


	const onDelete = () => console.log(1);

	const onDownload = () => console.log(2);

	const onRename = () => console.log(3);

	const onGetLink = () => console.log(4);

	const onShare = () => console.log(5);

	const onMoveTo = () => console.log(6);

	const onContextMenu = (e: MouseEvent) => {
		const contextMenuData: object = {onDelete, onDownload, onRename, onGetLink, onShare, onMoveTo};
		openContextMenu(e, contextMenuData, EContextMenuTypes.FOLDER);
	};

	const onDoubleClick = () => navigate(`${document.location.pathname}${document.location.hash + "/" + name}`);


	return (
		<Container className={isSelected ? "selected" : ""} onContextMenuCapture={onContextMenu} onClick={onClick} onDoubleClick={onDoubleClick}>
			{isLoading ? <Spinner/> : <Image src={folderImage}/>}
			<Name>{name}</Name>
		</Container>
	);
};

export default Folder;