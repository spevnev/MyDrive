import React, {createContext, MouseEvent, useEffect, useRef, useState} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar/Sidebar";
import {Page, Row} from "./index.styles";
import useContextMenu from "hooks/useContextMenu";
import {EContextMenuTypes} from "helpers/contextMenuOptionFactory";
import useTitle from "hooks/useTitle";
import usePath from "hooks/usePath";
import FileInputs from "./FileInputs";
import {useLazyQuery, useQuery} from "@apollo/client";
import {CAN_EDIT_CURRENT_FOLDER_QUERY, CURRENT_FOLDER_QUERY, MAIN_QUERY, USERNAMES_WHO_SHARE_WITH_ME_QUERY, USERS_SHARED_ENTRIES_QUERY} from "./index.queries";
import {getData} from "services/token";
import CreateFolderModal from "./modals/CreateFolderModal";
import {FolderArrayElement} from "services/file/fileTypes";
import {client} from "../../index";
import {useLocation, useNavigate} from "react-router-dom";
import FileExplorer from "./FileExplorer/FileExplorer";
import {getFolderByPath} from "../../services/file/file";
import useDebounce from "../../hooks/useDebounce";

export const ContextMenuContext = createContext({
	setIsContextMenuOpen: (arg: boolean) => {},
	openContextMenu: (e: MouseEvent, contextMenuData: object, contextMenuType: EContextMenuTypes) => {},
});
export const SidebarContext = createContext({
	isCreateButtonEnabled: true,
	isSidebarOpen: false,
	setIsSidebarOpen: (arg: boolean) => {},
});
export const CurrentDataContext = createContext({
	currentFolderId: 0,
	space_used: 0,
	folders: [] as FolderArrayElement[],
	sharedFolders: [] as FolderArrayElement[],
	currentEntries: [] as Entry[],
});
export const CacheContext = createContext({
	cacheCurrentEntries: (...args: CacheEntry[]) => {},
	cacheFolders: (...args: FolderArrayElement[]) => {},
	cacheImagePreviews: (id: number, data: Blob) => {},
	writeEntriesToCache: (arg1: Entry[], arg2?: boolean, arg3?: number) => {},
	writeFoldersToCache: (arg1: FolderArrayElement[], arg2?: FolderArrayElement[], arg3?: boolean) => {},
});

export type BinData = {
	put_at: number;
	prev_parent_id: number;
	prev_share_id: number | null;
}

export type CacheEntry = {
	id: number;
	parent_id: number;
	name: string;
	is_directory: boolean;
	preview?: string | null;
	bin_data?: BinData | null;
	can_edit?: boolean | null;
}

export type Entry = {
	id: number;
	parent_id: number;
	name: string;
	is_directory: boolean;
	preview: string | null;
	bin_data: BinData | null;
	can_edit: boolean | null;
}

let dropzoneTimeout: NodeJS.Timeout | null = null;
let prevPath: string = "";
const MainPage = () => {
	const path = decodeURI(window.location.hash.slice(1));
	const drive_id: number = getData()?.drive_id;
	const bin_id: number = getData()?.bin_id;

	const [openContextMenu, setIsContextMenuOpen, ContextMenu] = useContextMenu();

	const [currentFolderDataQuery] = useLazyQuery(CURRENT_FOLDER_QUERY);
	const [usersSharedEntriesQuery] = useLazyQuery(USERS_SHARED_ENTRIES_QUERY);
	const [usernamesWhoShareWithMeQuery] = useLazyQuery(USERNAMES_WHO_SHARE_WITH_ME_QUERY);
	const [canEditCurrentFolderQuery] = useLazyQuery(CAN_EDIT_CURRENT_FOLDER_QUERY);

	const {data, refetch: refetchMainQuery} = useQuery(MAIN_QUERY);
	const space_used = data ? data.user ? data.user.space_used : null : 0;
	const folders: FolderArrayElement[] = data ? data.folders || [] : [];
	const sharedFolders: FolderArrayElement[] = data ? data.sharedFolders || [] : [];

	const [currentFolderId, setCurrentFolderId] = useState(drive_id);
	const [currentEntries, setCurrentEntries] = useState<Entry[]>([]);
	const [canEditCurrentFolder, setCanEditCurrentFolder] = useState(true);
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
			if (!preview || imagePreviews[String(id)] || loadingRef.current[id]) return;

			const result = await fetch(preview);
			if (result.status !== 200) return;

			const blob = await result.blob();
			cacheImagePreviews(id, blob);
		});
	};


	const setData = (path: string, currentEntries: Entry[], newCanEditCurrentFolder: boolean, newCurrentFolderId: number, shouldLoadPreviews: boolean = true) => {
		prevPath = path;
		setCurrentEntries(currentEntries);
		if (newCanEditCurrentFolder !== canEditCurrentFolder) setCanEditCurrentFolder(newCanEditCurrentFolder);
		if (newCurrentFolderId !== currentFolderId) setCurrentFolderId(newCurrentFolderId);
		if (shouldLoadPreviews) loadPreviews(currentEntries);
	};

	const driveDirectoryEntries = async () => {
		const cleanPath = path.replace(/^Drive\/?/, "");
		let parent_id: number | null = getFolderByPath(folders, cleanPath);

		if (cleanPath.length > 0 && parent_id === null && folders.length > 0) navigate("/");
		parent_id = parent_id || drive_id;

		if (prevPath === path && folders.length === 0 && currentEntries.length === 0) return;

		const {data} = await currentFolderDataQuery({variables: {parent_id}});
		const entries = data?.entries || [];

		setData(path, entries, true, parent_id);
	};

	const sharedDirectoryEntries = async () => {
		if (prevPath === path) return;

		const cleanPath = path.replace(/^Shared\/?/, "");
		if (cleanPath.length === 0) { // root shared
			const {data} = await usernamesWhoShareWithMeQuery();

			let maxId = folders.reduce((max, {id}) => Math.max(max, id), 0);
			const usernames = new Set<string>();
			const entries: Entry[] = [];

			data.usernamesWhoShareWithMe.forEach((username: string) => {
				if (usernames.has(username)) return;

				usernames.add(username);
				entries.push({name: username, id: ++maxId, parent_id: 0, is_directory: true, preview: null, bin_data: null, can_edit: false});
			});

			setData(path, entries, false, drive_id, false);
		} else if (cleanPath.split("/").length === 1) { // shared by user
			const username = cleanPath.split("/")[0];
			const {data} = await usersSharedEntriesQuery({variables: {username}});
			const entries = data.usersSharedEntries;

			if (entries.length === 0) navigate("/");

			setData(path, entries, false, drive_id);
		} else { // shared folder
			const username = cleanPath.split("/")[0];
			const pathWithoutUsername = cleanPath.slice(username.length + 1);

			const id = getFolderByPath(sharedFolders.filter(folder => folder.username === username), pathWithoutUsername);
			if (id === null && sharedFolders.length > 0) navigate("/");
			if (id === null) return;

			const {data: {entry}} = await canEditCurrentFolderQuery({variables: {id}});
			const {data} = await currentFolderDataQuery({variables: {parent_id: id}});
			const entries = data?.entries || [];

			setData(path, entries, entry?.can_edit || false, id);
		}
	};

	const binDirectoryEntries = async () => {
		if (path.length > 4) navigate("/");

		if (prevPath === path && folders.length === 0 && currentEntries.length === 0) return;

		const {data} = await currentFolderDataQuery({variables: {parent_id: bin_id}});
		const entries = data?.entries || [];

		setData("Bin", entries, false, bin_id);
	};

	useEffect(() => {
		if (path.startsWith("Drive")) void driveDirectoryEntries();
		else if (path.startsWith("Shared")) void sharedDirectoryEntries();
		else if (path.startsWith("Bin")) void binDirectoryEntries();
	}, [location, folders, sharedFolders]);


	const clickIfExists = (elementId: string) => {
		const element: HTMLElement | null = document.getElementById(elementId);
		if (element) element.click();
	};

	const contextMenuData = {
		onNewFolder: () => setIsCreateFolderModalOpen(true),
		onUploadFolder: () => clickIfExists("folderUpload"),
		onUploadFile: () => clickIfExists("fileUpload"),
	};
	const openCreateContextMenu = (e: MouseEvent) => canEditCurrentFolder && openContextMenu(e, contextMenuData, EContextMenuTypes.CREATE);

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

	const writeFoldersToCache = (newFolders: FolderArrayElement[], newSharedFolders: FolderArrayElement[] = [], includeCurrent: boolean = true): void => {
		client.writeQuery({
			query: MAIN_QUERY,
			data: {
				folders: includeCurrent ? [...folders, ...newFolders] : newFolders,
				sharedFolders: includeCurrent ? [...sharedFolders, ...newSharedFolders] : newSharedFolders,
				user: {space_used},
			},
		});
	};

	const writeEntriesToCache = (newEntries: Entry[], includeCurrent: boolean = true, parent_id: number = currentFolderId): void => {
		const entries = includeCurrent ? [...currentEntries, ...newEntries] : newEntries;

		client.writeQuery({
			query: CURRENT_FOLDER_QUERY,
			data: {entries},
			variables: {parent_id},
		});
		if (parent_id === currentFolderId) setCurrentEntries(entries);
	};


	const changeCachedFolders = debounce(30, (data: FolderArrayElement[] | null) => writeFoldersToCache(data || []));
	const cacheFolders = (...newFolders: FolderArrayElement[]) => changeCachedFolders(folders => [...(folders || []), ...newFolders]);

	const changeCachedEntries = debounce(30, (data: Entry[] | null) => writeEntriesToCache(data || []));
	const cacheCurrentEntries = (...newEntries: CacheEntry[]) => {
		const newEntriesWithDefaultValues = newEntries.map(entry => ({preview: null, bin_data: null, can_edit: true, ...entry}));
		changeCachedEntries(entries => [...(entries || []), ...newEntriesWithDefaultValues]);
	};

	const changeImagePreviews = debounce(30, (data: null | { [key: string]: Blob }) => setImagePreviews(data || {}));
	const cacheImagePreviews = (id: number, image: Blob) => changeImagePreviews((data: null | { [key: string]: Blob }) => ({...(data || imagePreviews), [String(id)]: image}));

	const changeLoadingData = debounce(30, (data: null | [number, number][]) => setLoadingIds(new Map(data)));
	const setLoading = (id: number, value: number) => changeLoadingData((data: null | [number, number][]) => {
		const arr = [...(data || loadingRef.current.entries())];
		const [kvPair] = arr.filter(([k]) => k === id) as [[number, number]?];
		if (!kvPair) return [...arr, [id, value]];

		const [key, curValue] = kvPair;
		return [...arr.filter(([k]) => k !== key), [key || id, (curValue || 0) + value]];
	});


	const isCreateButtonEnabled = path.startsWith("Drive") ? true : canEditCurrentFolder;

	return (
		<Page onContextMenu={() => setIsContextMenuOpen(false)} onClick={() => setIsContextMenuOpen(false)} onDragOver={onDragOver}>
			<CurrentDataContext.Provider value={{folders, sharedFolders, currentFolderId, space_used, currentEntries}}>
				<CacheContext.Provider value={{cacheCurrentEntries, cacheFolders, cacheImagePreviews, writeEntriesToCache, writeFoldersToCache}}>
					<FileInputs setIsDropZoneVisible={setIsDropZoneVisible} isDropZoneVisible={isDropZoneVisible} setLoading={setLoading}/>
					<CreateFolderModal isOpen={isCreateFolderModalOpen} setIsOpen={setIsCreateFolderModalOpen}/>

					<Header/>
					<Row>
						<SidebarContext.Provider value={{isSidebarOpen, setIsSidebarOpen, isCreateButtonEnabled}}>
							<Sidebar openCreateContextMenu={openCreateContextMenu}/>

							<ContextMenuContext.Provider value={{openContextMenu, setIsContextMenuOpen}}>
								<FileExplorer openCreateContextMenu={openCreateContextMenu} loadingIds={loadingIds} path={path}
											  imagePreviews={imagePreviews} refetchMainQuery={refetchMainQuery}/>
							</ContextMenuContext.Provider>
							{ContextMenu}
						</SidebarContext.Provider>
					</Row>
				</CacheContext.Provider>
			</CurrentDataContext.Provider>
		</Page>
	);
};

export default MainPage;
