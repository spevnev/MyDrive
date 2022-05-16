import React, {createContext, MouseEvent, useEffect, useState} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar/Sidebar";
import {Page, Row} from "./index.styles";
import useContextMenu from "hooks/useContextMenu";
import {EContextMenuTypes} from "helpers/contextMenuOptionFactory";
import useTitle from "hooks/useTitle";
import usePath from "hooks/usePath";
import Inputs from "./Inputs";
import {useLazyQuery, useQuery} from "@apollo/client";
import {CURRENT_FOLDER_QUERY, MAIN_QUERY} from "./index.queries";
import {getData} from "services/token";
import CreateFolderModal from "./modals/CreateFolderModal";
import {FolderArrayElement} from "services/file/fileTypes";
import {client} from "../../index";
import {useLocation, useNavigate} from "react-router-dom";
import FileExplorer from "./FileExplorer";
import {getFolderByPath} from "../../services/file/file";

export const ContextMenuContext = createContext({
	setIsContextMenuOpen: (arg: boolean) => {},
	openContextMenu: (e: MouseEvent, contextMenuData: object, contextMenuType: EContextMenuTypes) => {},
});
export const SidebarContext = createContext({
	isSidebarOpen: false,
	setIsSidebarOpen: (arg: boolean) => {},
});
export const CurrentDataContext = createContext({currentFolderId: 0, space_used: 0, folders: [] as FolderArrayElement[]});
export const CacheContext = createContext({
	addCurrentEntriesToCacheAndSetLoading: (...args: Entry[]) => {},
	addCurrentEntriesToCache: (...args: Entry[]) => {},
	addFoldersToCache: (...args: FolderArrayElement[]) => {},
});

export type Entry = {
	id: number;
	parent_id: number;
	name: string;
	is_directory: boolean;
}

let timeout: NodeJS.Timeout | null = null;
let prevPath: string = "";
const MainPage = () => {
	const path = decodeURI(window.location.hash.slice(1));
	const drive_id = (getData() || {}).drive_id;

	const [openContextMenu, setIsContextMenuOpen, ContextMenu] = useContextMenu();

	const [currentFolderDataQuery, {data: currentFolderData}] = useLazyQuery(CURRENT_FOLDER_QUERY);

	const {data} = useQuery(MAIN_QUERY);
	const space_used = data ? data.user ? data.user.space_used : null : 0;
	const folders: FolderArrayElement[] = data ? data.folders : [];

	const [currentFolderId, setCurrentFolderId] = useState<number>(drive_id);
	const [currentEntries, setCurrentEntries] = useState<Entry[]>([]);
	const [loadingIds, setLoadingIds] = useState(new Set<number>());
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
	const [isDropZoneVisible, setIsDropZoneVisible] = useState(false);

	const location = useLocation();
	const navigate = useNavigate();

	usePath(path || "Drive");
	useTitle("Drive");

	useEffect(() => {
		const parent_id = getFolderByPath(folders, path.replace(/^Drive\//, "")) || drive_id;
		setCurrentFolderId(parent_id);

		prevPath = path;
		if (prevPath === path && folders.length === 0) return;

		currentFolderDataQuery({variables: {parent_id}});
	}, [location, folders]);

	useEffect(() => {
		if (!currentFolderData) return;

		const drivePath = path.replace(/^Drive\/?/, "");
		const parent_id = getFolderByPath(folders, drivePath);
		if (drivePath.length > 0 && parent_id === null && folders.length > 0) navigate("/");

		setCurrentEntries(currentFolderData.entries);
	}, [currentFolderData]);


	const clickIfExists = (elementId: string) => {
		const element: HTMLElement | null = document.getElementById(elementId);
		if (element) element.click();
	};

	const contextMenuData = {
		onNewFolder: () => setIsCreateFolderModalOpen(true),
		onUploadFolder: () => clickIfExists("folderUpload"),
		onUploadFile: () => clickIfExists("fileUpload"),
	};
	const openCreateContextMenu = (e: MouseEvent) => openContextMenu(e, contextMenuData, EContextMenuTypes.CREATE);

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

	const addCurrentEntriesToCache = (...newEntries: Entry[]): void => {
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

	const addCurrentEntriesToCacheAndSetLoading = (...newEntries: Entry[]): void => {
		setLoadingIds(new Set([...newEntries.map(e => e.id), ...loadingIds]));
		addCurrentEntriesToCache(...newEntries);
	};

	const stopLoading = (id: number) => setLoadingIds(new Set([...loadingIds].filter(i => i !== id)));


	return (
		<Page onContextMenu={() => setIsContextMenuOpen(false)} onDragOver={onDragOver}>
			<CurrentDataContext.Provider value={{folders, currentFolderId, space_used}}>
				<CacheContext.Provider value={{addCurrentEntriesToCacheAndSetLoading, addCurrentEntriesToCache, addFoldersToCache}}>
					<Inputs setIsDropZoneVisible={setIsDropZoneVisible} isDropZoneVisible={isDropZoneVisible} stopLoading={stopLoading}/>
					<CreateFolderModal isOpen={isCreateFolderModalOpen} setIsOpen={setIsCreateFolderModalOpen}/>
				</CacheContext.Provider>

				<Header/>
				<Row>
					<SidebarContext.Provider value={{isSidebarOpen, setIsSidebarOpen}}>
						<Sidebar openCreateContextMenu={openCreateContextMenu}/>

						<ContextMenuContext.Provider value={{openContextMenu, setIsContextMenuOpen}}>
							<FileExplorer openCreateContextMenu={openCreateContextMenu} path={path} currentEntries={currentEntries} loadingIds={loadingIds}/>
						</ContextMenuContext.Provider>
						{ContextMenu}
					</SidebarContext.Provider>
				</Row>
			</CurrentDataContext.Provider>
		</Page>
	);
};

export default MainPage;