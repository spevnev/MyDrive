import React, {MouseEvent, useContext} from "react";
import {Container, Icons, Row, SidebarMenu} from "./Navigation.styles";
import {ReactComponent as ShareIcon} from "assets/share.svg";
import {ReactComponent as DownloadIcon} from "assets/download.svg";
import {ReactComponent as BinIcon} from "assets/bin.svg";
import {ReactComponent as PreviewIcon} from "assets/eye.svg";
import {ReactComponent as RenameIcon} from "assets/rename.svg";
import {ReactComponent as MoveIcon} from "assets/moveTo.svg";
import menuIcon from "assets/menu.svg";
import Path from "./Path";
import {ContextMenuContext, SidebarContext} from "../index";
import {EntryActionsContext} from "../FileExplorer";

export enum EActionType {
	HIDDEN,
	SINGLE,
	MULTIPLE
}

type NavigationProps = {
	path: string;
	actionType: EActionType;
}

const Navigation = ({path = "", actionType = EActionType.HIDDEN}: NavigationProps) => {
	const {setIsContextMenuOpen} = useContext(ContextMenuContext);
	const {isSidebarOpen, setIsSidebarOpen} = useContext(SidebarContext);
	const {onDelete, onDownload, onRename, onShare, onPreview, onMoveTo} = useContext(EntryActionsContext);


	const onClick = (e: MouseEvent) => {
		e.stopPropagation();
		setIsContextMenuOpen(false);
	};


	return (
		<Container>
			<Row>
				<SidebarMenu src={menuIcon} className={isSidebarOpen ? "shown" : ""} onClick={() => setIsSidebarOpen(!isSidebarOpen)}/>
				<Path path={path}/>
			</Row>

			{actionType !== 0 &&
				<Icons onClick={onClick}>
					{actionType === 1 && <>
						<PreviewIcon onClick={() => onPreview()}/>
						<RenameIcon onClick={() => onRename()}/>
					</>}
					<MoveIcon onClick={() => onMoveTo()}/>
					<ShareIcon onClick={() => onShare()}/>
					<DownloadIcon onClick={() => onDownload()}/>
					<BinIcon onClick={() => onDelete()}/>
				</Icons>
			}
		</Container>
	);
};

export default Navigation;