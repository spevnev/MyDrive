import React, {JSX, MouseEvent, useContext} from "react";
import addIcon from "assets/add-solid.svg";
import diskIcon from "assets/drive.svg";
import ProgressBar from "components/ProgressBar";
import {Button, Container, Cross, Explorer, Icon, Overlay, ProgressText, Storage, Text} from "./Sidebar.styles";
import folderIcon from "assets/folder.svg";
import sharedIcon from "assets/users.svg";
import binIcon from "assets/bin.svg";
import Entry from "./Entry";
import {Folder} from "services/file/fileTypes";
import {CurrentDataContext, SidebarContext} from "../index";
import {foldersArrayToObject, groupFoldersByUsername} from "../../../services/file/file";

type SidebarProps = {
	openCreateContextMenu: (e: MouseEvent) => void;
}

const MAX_CAPACITY = 1000; // in Megabytes
const Sidebar = ({openCreateContextMenu}: SidebarProps) => {
	const {isSidebarOpen, setIsSidebarOpen, isCreateButtonEnabled} = useContext(SidebarContext);
	const {sharedFolders, folders, space_used} = useContext(CurrentDataContext);


	const onClick = (e: MouseEvent) => {
		const target: HTMLElement = e.currentTarget as HTMLElement;
		e.pageX = target.offsetLeft;
		e.pageY = target.offsetTop + target.offsetHeight;

		openCreateContextMenu(e);
	};

	const folderToEntries = ({name, children, username}: Folder, depth: number = 0): JSX.Element => (
		<Entry icon={folderIcon} path={name} key={name} text={name} hasChildren={children.length > 0} depth={depth + 1}>
			{children.map(folder => folderToEntries(folder, depth + 1))}
		</Entry>
	);

	const bytesToMegabytes = (bytes: number, decimalPlaces: number): number => {
		const MB = 2 ** 20;
		const megabytes = bytes / MB;

		const temp = 10 ** decimalPlaces;
		return Math.floor(megabytes * temp) / temp;
	};


	const spaceUsed = space_used ? bytesToMegabytes(space_used, 2) : 0;
	const sharedFoldersObjects = groupFoldersByUsername(foldersArrayToObject(sharedFolders));
	const driveFolders = foldersArrayToObject(folders);

	return (
		<Overlay className={isSidebarOpen ? "" : "hidden"} onClick={() => setIsSidebarOpen(false)}>
			<Container>
				<Button onClick={onClick} isDisabled={!isCreateButtonEnabled}>
					<Icon src={addIcon}/>
					<Text>Add</Text>
				</Button>

				<Explorer>
					<Entry icon={diskIcon} text="Drive" path="Drive" hasChildren={driveFolders.length > 0}>
						{driveFolders.map(folder => folderToEntries(folder))}
					</Entry>
					<Entry icon={sharedIcon} text="Shared" path="Shared" hasChildren={sharedFoldersObjects.length > 0}>
						{sharedFoldersObjects.map(folder => folderToEntries(folder))}
					</Entry>
					<Entry icon={binIcon} text="Bin" path="Bin"/>
				</Explorer>

				<Storage>
					<ProgressBar fillPercent={spaceUsed / MAX_CAPACITY * 100}/>
					<ProgressText>{spaceUsed}MBs of {MAX_CAPACITY / 1000}GB used</ProgressText>
				</Storage>
			</Container>

			<Cross/>
		</Overlay>
	);
};

export default Sidebar;