import React, {createContext, MouseEvent, useEffect, useRef, useState} from "react";
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
import useDebounce from "../../hooks/useDebounce";

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
	cacheCurrentEntries: (...args: Entry[]) => {},
	cacheFolders: (...args: FolderArrayElement[]) => {},
	cacheImagePreviews: (id: number, data: Blob) => {},
});

export type Entry = {
	id: number;
	parent_id: number;
	name: string;
	is_directory: boolean;
	preview: string | null;
}

let dropzoneTimeout: NodeJS.Timeout | null = null;
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
	const [loadingIds, setLoadingIds] = useState(new Map<number, number>());
	const [imagePreviews, setImagePreviews] = useState<{ [key: string]: Blob }>({});

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
	const [isDropZoneVisible, setIsDropZoneVisible] = useState(false);

	const loadingRef = useRef<any>(null);
	loadingRef.current = loadingIds;

	const location = useLocation();
	const navigate = useNavigate();
	const debounce = useDebounce();

	usePath(path || "Drive");
	useTitle("Drive");

	const loadPreviews = (entries: Entry[]) => {
		entries.forEach(async ({id, preview}) => {
			if (!preview) return;

			try {
				const result = await fetch(preview);
				if (result.status !== 200) return;

				const blob = await result.blob();
				cacheImagePreviews(id, blob);
			} catch (e) {}
		});
	};

	useEffect(() => {
		if (!currentFolderData) return;

		const drivePath = path.replace(/^Drive\/?/, "");
		const parent_id = getFolderByPath(folders, drivePath);
		if (drivePath.length > 0 && parent_id === null && folders.length > 0) navigate("/");

		setCurrentEntries(currentFolderData.entries);
		loadPreviews(currentFolderData.entries);
	}, [currentFolderData]);

	useEffect(() => {
		const parent_id = getFolderByPath(folders, path.replace(/^Drive\/?/, "")) || drive_id;
		setCurrentFolderId(parent_id);

		if (prevPath === path && folders.length === 0 && currentEntries.length === 0) return;
		prevPath = path;

		currentFolderDataQuery({variables: {parent_id}});
	}, [location, folders]);


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
		if (dropzoneTimeout) clearTimeout(dropzoneTimeout);
		dropzoneTimeout = setTimeout(() => {
			setIsDropZoneVisible(false);
		}, 200);
	};

	const cacheFolders = (...newFolders: FolderArrayElement[]): void => {
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

	const cacheCurrentEntries = (...newEntries: Entry[]): void => {
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

	const cacheImagePreviews = (id: number, data: Blob) => setImagePreviews({...imagePreviews, [String(id)]: data});

	const changeLoadingData = debounce(50, (data: null | [number, number][]) => {
		const map = new Map<number, number>();
		data?.forEach(([k, v]) => map.set(k, v));
		setLoadingIds(map);
	});
	const setLoading = (id: number, value: number) => changeLoadingData((data: null | [number, number][]) => {
		const arr = [...(data || loadingRef.current.entries())];
		const [kvPair] = arr.filter(([k]) => k === id) as [[number, number]?];
		if (!kvPair) return [...arr, [id, value]];

		const [key, curValue] = kvPair;
		return [...arr.filter(([k]) => k !== key), [key || id, (curValue || 0) + value]];
	});

	return (
		<Page onContextMenu={() => setIsContextMenuOpen(false)} onDragOver={onDragOver}>
			<CurrentDataContext.Provider value={{folders, currentFolderId, space_used}}>
				<CacheContext.Provider value={{cacheCurrentEntries, cacheFolders, cacheImagePreviews}}>
					<Inputs setIsDropZoneVisible={setIsDropZoneVisible} isDropZoneVisible={isDropZoneVisible} setLoading={setLoading}/>
					<CreateFolderModal isOpen={isCreateFolderModalOpen} setIsOpen={setIsCreateFolderModalOpen}/>
				</CacheContext.Provider>

				<Header/>
				<Row>
					<SidebarContext.Provider value={{isSidebarOpen, setIsSidebarOpen}}>
						<Sidebar openCreateContextMenu={openCreateContextMenu}/>

						<ContextMenuContext.Provider value={{openContextMenu, setIsContextMenuOpen}}>
							<FileExplorer openCreateContextMenu={openCreateContextMenu} path={path} currentEntries={currentEntries} loadingIds={loadingIds}
										  imagePreviews={imagePreviews}/>
						</ContextMenuContext.Provider>
						{ContextMenu}
					</SidebarContext.Provider>
				</Row>
			</CurrentDataContext.Provider>
		</Page>
	);
};

export default MainPage;