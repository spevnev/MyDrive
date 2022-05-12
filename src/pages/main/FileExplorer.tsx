import React, {MouseEvent, useContext, useEffect, useState} from "react";
import Navigation, {EActionType} from "./Navigation/Navigation";
import {Column, Main} from "./index.styles";
import Category, {DataElement} from "./Category/Category";
import Folder from "./Category/Folder";
import File, {EFileType} from "./Category/File";
import {splitName} from "../../services/file/fileRequest";
import {getFileType} from "../../helpers/FileType";
import {useLocation} from "react-router-dom";
import {ContextMenuContext, Entry, SidebarContext} from "./index";

type FileExplorerProps = {
	path: string;
	openCreateContextMenu: (e: MouseEvent) => any;
	currentEntries: Entry[];
	loadingIds: Set<number>;
}

const FileExplorer = ({path, openCreateContextMenu, currentEntries, loadingIds}: FileExplorerProps) => {
	const {isSidebarShown, setIsSidebarShown} = useContext(SidebarContext);
	const {setIsContextMenuOpen} = useContext(ContextMenuContext);

	const [selected, setSelected] = useState<{ [key: string]: boolean[] }>({});

	const location = useLocation();

	useEffect(() => {
		setSelected({});
	}, [location]);


	const onClick = () => {
		setIsContextMenuOpen(false);
		if (selectedNum > 0) setSelected({});
	};

	const getSelectedNum = (): number => {
		const values = Object.values(selected);

		return values.reduce((prev: number, cur: boolean[]) => {
			const currentNum = cur.reduce((prev: number, cur: boolean) => prev + (cur ? 1 : 0), 0);
			return prev + currentNum;
		}, 0);
	};


	const folderData: DataElement[] = currentEntries.filter(entry => entry.is_directory).map(folder =>
		({name: folder.name, key: String(folder.id), isLoading: loadingIds.has(folder.id)}));
	const fileData: DataElement[] = currentEntries.filter(entry => !entry.is_directory).map(file => {
		const [, extension] = splitName(file.name);
		const type = extension ? getFileType(extension.slice(1)) : EFileType.OTHER;

		return {key: String(file.id), type, filename: file.name, isLoading: loadingIds.has(file.id)};
	});

	const selectedNum: number = getSelectedNum();
	const navigationActionType: EActionType = selectedNum === 0 ? EActionType.HIDDEN : selectedNum === 1 ? EActionType.SINGLE : EActionType.MULTIPLE;

	return (
		<Main onClick={onClick}>
			<Navigation path={path} actionType={navigationActionType} isSidebarShown={isSidebarShown} setIsSidebarShown={setIsSidebarShown}/>
			<Column onContextMenu={openCreateContextMenu}>
				<Category name="Folders" Element={Folder} data={folderData} selected={selected} setSelected={setSelected}/>
				<Category name="Files" Element={File} data={fileData} selected={selected} setSelected={setSelected}/>
			</Column>
		</Main>
	);
};

export default FileExplorer;