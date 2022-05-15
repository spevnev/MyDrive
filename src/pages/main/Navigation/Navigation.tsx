import React, {useContext} from "react";
import {Container, Icons, Row, SidebarMenu} from "./Navigation.styles";
import {ReactComponent as ShareIcon} from "assets/share.svg";
import {ReactComponent as DownloadIcon} from "assets/download.svg";
import {ReactComponent as BinIcon} from "assets/bin.svg";
import {ReactComponent as PreviewIcon} from "assets/eye.svg";
import {ReactComponent as RenameIcon} from "assets/rename.svg";
import menuIcon from "assets/menu.svg";
import Path from "./Path";
import {SidebarContext} from "../index";
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
	const {isSidebarOpen, setIsSidebarOpen} = useContext(SidebarContext);
	const {onDelete, onDownload, onRename, onShare, onPreview} = useContext(EntryActionsContext);


	return (
		<Container>
			<Row>
				<SidebarMenu src={menuIcon} className={isSidebarOpen ? "shown" : ""} onClick={() => setIsSidebarOpen(!isSidebarOpen)}/>
				<Path path={path}/>
			</Row>

			{actionType !== 0 &&
				<Icons onClick={e => e.stopPropagation()}>
					{actionType === 1 && <>
						<PreviewIcon onClick={() => onPreview()}/>
						<RenameIcon onClick={() => onRename()}/>
					</>}
					<ShareIcon onClick={() => onShare()}/>
					<DownloadIcon onClick={() => onDownload()}/>
					<BinIcon onClick={() => onDelete()}/>
				</Icons>
			}
		</Container>
	);
};

export default Navigation;