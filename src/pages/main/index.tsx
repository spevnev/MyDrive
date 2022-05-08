import React, {createContext, MouseEvent, useEffect, useState} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar/Sidebar";
import Navigation, {EActionType} from "./Navigation/Navigation";
import Category, {DataElement} from "./Category/Category";
import {Column, Main, Page, Row} from "./index.styles";
import File, {EFileType} from "./Category/File";
import useContextMenu from "hooks/useContextMenu";
import Folder from "./Category/Folder";
import {EContextMenuTypes} from "helpers/contextMenuOptionFactory";
import useTitle from "hooks/useTitle";
import usePath from "../../hooks/usePath";
import Inputs from "./Inputs";
import {useLazyQuery, useQuery} from "@apollo/client";
import {CURRENT_FOLDER_QUERY, MAIN_QUERY} from "./index.queries";
import {getData} from "../../services/token";
import {getFolderByPath, splitName} from "../../services/file/fileRequest";
import CreateFolderModal from "./CreateFolderModal";
import {FolderArrayElement} from "../../services/file/fileTypes";
import {client} from "../../index";
import {getFileType} from "../../helpers/FileType";
import {useLocation} from "react-router-dom";

export const ContextMenuContext = createContext({});
export const SelectedContext = createContext({});

type Entry = {
	id: number;
	parent_id: number;
	name: string;
	is_directory: boolean;
}

let timeout: NodeJS.Timeout | null = null;
let prevPath: string = "";
const MainPage = () => {
	const path = decodeURI(window.location.hash.slice(1));

	const [openContextMenu, setIsContextMenuOpen, ContextMenu] = useContextMenu();
	const {data} = useQuery(MAIN_QUERY);
	const [currentFolderDataQuery] = useLazyQuery(CURRENT_FOLDER_QUERY);

	const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
	const [selected, setSelected] = useState<{ [key: string]: boolean[] }>({});
	const [isSidebarShown, setIsSidebarShown] = useState(false);
	const [isDropZoneVisible, setIsDropZoneVisible] = useState(false);
	const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
	const [currentEntries, setCurrentEntries] = useState<Entry[]>([]);
	const location = useLocation();

	usePath(path || "Drive");
	useTitle("Drive");

	useEffect(() => {
		if (!data || !data.folders) return;

		if (path.startsWith("Drive") && path.length > 6) {
			setCurrentFolderId(getFolderByPath(data.folders, path.slice(6)));
		} else {
			const tokenData = getData();
			if (!tokenData) return;
			setCurrentFolderId(tokenData.drive_id);
		}
	}, [data]);

	useEffect(() => {
		if (prevPath === path) return;
		prevPath = path;
		setSelected({});

		(async () => {
			const tokenData = getData() || {};
			const parent_id = getFolderByPath(folders, path.replace(/^Drive\//, "")) || tokenData.drive_id;
			const result = await currentFolderDataQuery({variables: {parent_id}});
			if (!result.data.entries) return;

			setCurrentEntries(result.data.entries);
		})();
	}, [location]);


	const clickIfExists = (elementId: string) => {
		const element: HTMLElement | null = document.getElementById(elementId);
		if (element) element.click();
	};

	const onNewFolder = () => setIsCreateFolderModalOpen(true);

	const contextMenuData = {onNewFolder, onUploadFolder: () => clickIfExists("folderUpload"), onUploadFile: () => clickIfExists("fileUpload")};
	const openCreateContextMenu = (e: MouseEvent) => openContextMenu(e, contextMenuData, EContextMenuTypes.CREATE);

	const onClick = () => {
		setIsContextMenuOpen(false);
		if (selectedNum > 0) setSelected({});
	};

	const onDragOver = (e: any) => {
		const event: Event = e;
		event.preventDefault();
		event.stopPropagation();

		setIsDropZoneVisible(true);
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			setIsDropZoneVisible(false);
		}, 200);
	};

	const getSelectedNum = (): number => {
		const values = Object.values(selected);

		return values.reduce((prev: number, cur: boolean[]) => {
			const currentNum = cur.reduce((prev: number, cur: boolean) => prev + (cur ? 1 : 0), 0);
			return prev + currentNum;
		}, 0);
	};

	const addFoldersToCache = (...newFolders: FolderArrayElement[]): void => {
		client.writeQuery({
			query: MAIN_QUERY,
			data: {
				folders: [
					...folders,
					...newFolders,
				],
				user: {
					space_used,
					__typename: "UserModel",
				},
			},
		});
	};


	const folderData: DataElement[] = currentEntries.filter(entry => entry.is_directory).map(folder => ({name: folder.name, key: String(folder.id)}));
	const fileData: DataElement[] = currentEntries.filter(entry => !entry.is_directory).map(file => {
		const [, extension] = splitName(file.name);
		const type = extension ? getFileType(extension.slice(1)) : EFileType.OTHER;

		return {key: String(file.id), type, filename: file.name};
	});
	const selectedNum: number = getSelectedNum();
	const navigationActionType: EActionType = selectedNum === 0 ? EActionType.HIDDEN : selectedNum === 1 ? EActionType.SINGLE : EActionType.MULTIPLE;

	const space_used = data ? data.user ? data.user.space_used : null : 0;
	const folders: FolderArrayElement[] = data ? data.folders : [];

	return (
		<Page onContextMenu={() => setIsContextMenuOpen(false)} onDragOver={onDragOver}>
			<Inputs setIsDropZoneVisible={setIsDropZoneVisible} isDropZoneVisible={isDropZoneVisible} addFoldersToCache={addFoldersToCache}
					currentFolderId={currentFolderId} folders={folders} space_used={space_used}/>

			<Header/>
			<Row onClick={onClick}>
				<Sidebar openCreateContextMenu={openCreateContextMenu} folders={folders} space_used={space_used}
						 isSidebarShown={isSidebarShown} setIsSidebarShown={setIsSidebarShown}/>
				<Main>
					<Navigation path={path} actionType={navigationActionType} isSidebarShown={isSidebarShown} setIsSidebarShown={setIsSidebarShown}/>
					<Column onContextMenu={openCreateContextMenu}>
						{ContextMenu}
						<ContextMenuContext.Provider value={{openContextMenu}}>
							<SelectedContext.Provider value={{selected, setSelected}}>
								<Category name="Folders" Element={Folder} data={folderData}/>
								<Category name="Files" Element={File} data={fileData}/>
							</SelectedContext.Provider>
						</ContextMenuContext.Provider>
					</Column>
				</Main>
			</Row>

			<CreateFolderModal isOpen={isCreateFolderModalOpen} setIsOpen={setIsCreateFolderModalOpen} folders={folders} addFoldersToCache={addFoldersToCache}/>
		</Page>
	);
};

export default MainPage;