import React, {MouseEvent, useContext, useEffect} from "react";
import addIcon from "assets/add-solid.svg";
import diskIcon from "assets/drive.svg";
import ProgressBar from "components/ProgressBar";
import {Button, Container, Cross, Explorer, Icon, Overlay, ProgressText, Storage, Text} from "./Sidebar.styles";
import {SidebarContext} from "../index";
import {useQuery} from "@apollo/client";
import {SIDEBAR_QUERY} from "./Sidebar.queries";
import {Folder, foldersArrayToObject} from "services/foldersArrayToObject";
import folderIcon from "assets/folder.svg";
import sharedIcon from "assets/users.svg";
import binIcon from "assets/bin.svg";
import Entry from "./Entry";

type SidebarProps = {
	openCreateContextMenu: (e: MouseEvent) => void;
}

const MEGABYTE = 2 ** 20;

const MAX_CAPACITY = 1000; // in Megabytes
const Sidebar = ({openCreateContextMenu}: SidebarProps) => {
	const {loading, error, data} = useQuery(SIDEBAR_QUERY);
	const {isSidebarShown, setIsSidebarShown} = useContext<any>(SidebarContext);

	useEffect(() => {
		if (!loading && !error && !data.user) localStorage.removeItem("JWT");
	}, [data]);


	const onClick = (e: MouseEvent) => {
		const target: HTMLElement = e.currentTarget as HTMLElement;
		e.pageX = target.offsetLeft;
		e.pageY = target.offsetTop + target.offsetHeight;

		openCreateContextMenu(e);
	};

	const folderToEntries = ({name, children}: Folder, depth: number = 0): JSX.Element => (
		<Entry icon={folderIcon} path={name} key={name} text={name} hasChildren={children.length > 0} depth={depth + 1}>
			{children.map(folder => folderToEntries(folder, depth + 1))}
		</Entry>
	);

	const bytesToMegabytes = (bytes: number, decimalPlaces: number): number => {
		const mbs = bytes / MEGABYTE;
		return Math.floor(mbs * 10 ** decimalPlaces) / 10 ** decimalPlaces;
	};


	const spaceUsedPercentage: number = data ? bytesToMegabytes(data.user.space_used, 2) || 0 : 0;
	const sharedFolders = foldersArrayToObject(data ? data.rootSharedFolders || [] : []);
	const driveFolders = foldersArrayToObject(data ? data.folders || [] : []);

	return (
		<Overlay className={isSidebarShown ? "" : "hidden"} onClick={() => setIsSidebarShown(false)}>
			<Container>
				<Button onClick={onClick}>
					<Icon src={addIcon}/>
					<Text>Add</Text>
				</Button>

				<Explorer>
					<Entry icon={diskIcon} text="Drive" path="Drive" hasChildren={driveFolders.length > 0}>
						{driveFolders.map(folder => folderToEntries(folder))}
					</Entry>
					<Entry icon={sharedIcon} text="Shared" path="" hasChildren={sharedFolders.length > 0}>
						{sharedFolders.map(folder => folderToEntries(folder))}
					</Entry>
					<Entry icon={binIcon} text="Bin" path="Bin"/>
				</Explorer>

				<Storage>
					<ProgressBar fillPercent={spaceUsedPercentage}/>
					<ProgressText>{Math.floor(MAX_CAPACITY * spaceUsedPercentage / 100 * 10) / 10}MB of {MAX_CAPACITY / 1000}GB used</ProgressText>
				</Storage>
			</Container>

			<Cross/>
		</Overlay>
	);
};

export default Sidebar;