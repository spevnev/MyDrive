import React, {MouseEvent, useContext} from "react";
import {Container, Icons, Row, SidebarMenu} from "./Navigation.styles";
import {ReactComponent as ShareIcon} from "assets/share.svg";
import {ReactComponent as DownloadIcon} from "assets/download.svg";
import {ReactComponent as BinIcon} from "assets/bin.svg";
import {ReactComponent as PreviewIcon} from "assets/eye.svg";
import {ReactComponent as RenameIcon} from "assets/rename.svg";
import {ReactComponent as MoveIcon} from "assets/moveTo.svg";
import {ReactComponent as InfoIcon} from "assets/info.svg";
import {ReactComponent as FireIcon} from "assets/fire.svg";
import {ReactComponent as ReloadIcon} from "assets/reload.svg";
import menuIcon from "assets/menu.svg";
import Path from "./Path";
import {ContextMenuContext, SidebarContext} from "../index";
import {EntryActionsContext} from "../FileExplorer/FileExplorer";

export enum ENavigationType {
	HIDDEN,
	SINGLE,
	MULTIPLE
}

type NavigationProps = {
	path: string;
	navigationType: ENavigationType;
	inBin: boolean;
	canEdit: boolean;
	canPreview: boolean;
}

const Navigation = ({path = "", navigationType = ENavigationType.HIDDEN, inBin, canEdit, canPreview}: NavigationProps) => {
	const {setIsContextMenuOpen} = useContext(ContextMenuContext);
	const {isSidebarOpen, setIsSidebarOpen} = useContext(SidebarContext);
	const {onDelete, onDownload, onRename, onShare, onPreview, onMoveTo, onFullyDelete, onRestore, onInfo} = useContext(EntryActionsContext);


	const onClick = (e: MouseEvent) => {
		e.stopPropagation();
		setIsContextMenuOpen(false);
	};


	const arePropsDefined = inBin !== undefined && canEdit !== undefined && canPreview !== undefined;
	const areIconsVisible = navigationType !== ENavigationType.HIDDEN && arePropsDefined;

	const inBinIcons = (
		<>
			{navigationType === ENavigationType.SINGLE && <InfoIcon onClick={() => onInfo()}/>}
			<FireIcon onClick={() => onFullyDelete()}/>
			<ReloadIcon onClick={() => onRestore()}/>
		</>
	);

	const canEditIcons = (
		<>
			{navigationType === ENavigationType.SINGLE && <>
				{canPreview && <PreviewIcon onClick={() => onPreview()}/>}
				<RenameIcon onClick={() => onRename()}/>
			</>}
			<MoveIcon onClick={() => onMoveTo()}/>
			<ShareIcon onClick={() => onShare()}/>
			<DownloadIcon onClick={() => onDownload()}/>
			<BinIcon onClick={() => onDelete()}/>
		</>
	);

	const viewOnlyIcons = (
		<>
			{navigationType === ENavigationType.SINGLE && canPreview && <PreviewIcon onClick={() => onPreview()}/>}
			<DownloadIcon onClick={() => onDownload()}/>
		</>
	);

	return (
		<Container>
			<Row>
				<SidebarMenu src={menuIcon} className={isSidebarOpen ? "shown" : ""} onClick={() => setIsSidebarOpen(!isSidebarOpen)}/>
				<Path path={path}/>
			</Row>

			{areIconsVisible &&
				<Icons onClick={onClick}>
					{inBin ? inBinIcons : canEdit ? canEditIcons : viewOnlyIcons}
				</Icons>
			}
		</Container>
	);
};

export default Navigation;