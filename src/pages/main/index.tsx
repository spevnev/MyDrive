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
import usePath from "hooks/usePath";
import Inputs from "./Inputs";
import {useLazyQuery, useQuery} from "@apollo/client";
import {CURRENT_FOLDER_QUERY, MAIN_QUERY} from "./index.queries";
import {getData} from "services/token";
import {getFolderByPath, splitName} from "services/file/fileRequest";
import CreateFolderModal from "./modals/CreateFolderModal";
import {FolderArrayElement} from "services/file/fileTypes";
import {client} from "../../index";
import {getFileType} from "helpers/FileType";
import {useLocation} from "react-router-dom";

export const ContextMenuContext = createContext({});
export const SelectedContext = createContext({});

export type Entry = {
	id: number;
	parent_id: number;
	name: string;
	is_directory: boolean;
}

// TODO: try to divide into multiple components...
let timeout: NodeJS.Timeout | null = null;
let prevPath: string = "";
const MainPage = () => {
	const path = decodeURI(window.location.hash.slice(1));
	const drive_id = (getData() || {}).drive_id;

	const [openContextMenu, setIsContextMenuOpen, ContextMenu] = useContextMenu();
	const location = useLocation();

	const [currentFolderDataQuery, {data: currentFolderData}] = useLazyQuery(CURRENT_FOLDER_QUERY);
	const {data} = useQuery(MAIN_QUERY);

	const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
	const [selected, setSelected] = useState<{ [key: string]: boolean[] }>({});
	const [isSidebarShown, setIsSidebarShown] = useState(false);
	const [isDropZoneVisible, setIsDropZoneVisible] = useState(false);
	const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
	const [currentEntries, setCurrentEntries] = useState<Entry[]>([]);
	const [loadingIds, setLoadingIds] = useState(new Set<number>());

	usePath(path || "Drive");
	useTitle("Drive");

	useEffect(() => {
		const parent_id = getFolderByPath(folders, path.replace(/^Drive\//, "")) || drive_id;
		setCurrentFolderId(parent_id);

		if (prevPath === path || folders.length === 0) return;
		prevPath = path;

		currentFolderDataQuery({variables: {parent_id}});
		setSelected({});
	}, [location, data]);

	useEffect(() => {
		if (!currentFolderData) return;
		setCurrentEntries(currentFolderData.entries);
	}, [currentFolderData]);


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

	const addCurrentEntriesToCacheAndSetLoading = (...newEntries: Entry[]): void => {
		setLoadingIds(new Set([...newEntries.map(e => e.id), ...loadingIds]));

		client.writeQuery({
			query: CURRENT_FOLDER_QUERY,
			data: {
				entries: [
					...currentEntries,
					...newEntries,
				],
			},
			variables: {
				parent_id: currentFolderId,
			},
		});
	};

	const stopLoading = (id: number) => setLoadingIds(new Set([...loadingIds].filter(i => i !== id)));


	const folderData: DataElement[] = currentEntries.filter(entry => entry.is_directory).map(folder =>
		({name: folder.name, key: String(folder.id), isLoading: loadingIds.has(folder.id)}));
	const fileData: DataElement[] = currentEntries.filter(entry => !entry.is_directory).map(file => {
		const [, extension] = splitName(file.name);
		const type = extension ? getFileType(extension.slice(1)) : EFileType.OTHER;

		return {key: String(file.id), type, filename: file.name, isLoading: loadingIds.has(file.id)};
	});
	const selectedNum: number = getSelectedNum();
	const navigationActionType: EActionType = selectedNum === 0 ? EActionType.HIDDEN : selectedNum === 1 ? EActionType.SINGLE : EActionType.MULTIPLE;

	const space_used = data ? data.user ? data.user.space_used : null : 0;
	const folders: FolderArrayElement[] = data ? data.folders : [];

	return (
		<Page onContextMenu={() => setIsContextMenuOpen(false)} onDragOver={onDragOver}>
			<Inputs setIsDropZoneVisible={setIsDropZoneVisible} isDropZoneVisible={isDropZoneVisible} currentFolderId={currentFolderId} folders={folders} space_used={space_used}
					addEntriesToCache={addCurrentEntriesToCacheAndSetLoading} addFoldersToCache={addFoldersToCache} stopLoading={stopLoading}/>

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

			<CreateFolderModal currentFolderId={currentFolderId || drive_id} isOpen={isCreateFolderModalOpen} setIsOpen={setIsCreateFolderModalOpen} folders={folders}
							   addFoldersToCache={addFoldersToCache} addEntriesToCache={addCurrentEntriesToCacheAndSetLoading}/>
		</Page>
	);
};

export default MainPage;