import React, {createContext, MouseEvent, useContext, useEffect, useState} from "react";
import PreviewOverlay from "./PreviewOverlay";
import Navigation, {ENavigationType} from "../Navigation/Navigation";
import {Column, Main} from "./FileExplorer.styles";
import Category, {DataElement} from "../Category/Category";
import Folder from "../Category/Folder";
import File, {EFileType} from "../Category/File";
import {getFileType} from "helpers/FileType";
import {useLocation} from "react-router-dom";
import {CacheContext, ContextMenuContext, CurrentDataContext, Entry} from "../index";
import ShareEntriesModal, {ShareEntriesModalData, User} from "../modals/ShareEntriesModal";
import {getFolderPath, splitName} from "services/file/file";
import MoveEntriesModal, {MoveEntriesModalData} from "../modals/MoveEntriesModal";
import RenameEntryModal, {RenameEntryModalData} from "../modals/RenameEntryModal";
import {useLazyQuery, useMutation} from "@apollo/client";
import {
	FULLY_DELETE_ENTRIES_MUTATION,
	GET_ENTRIES_SHARE_POLICY_QUERY,
	GET_ENTRY_OWNER_USERNAME_QUERY,
	GET_ENTRY_QUERY,
	GET_PRESIGNED_URLS_QUERY,
	GET_USERNAMES_QUERY,
	PUT_ENTRIES_IN_BIN_MUTATION,
	RESTORE_ENTRIES_MUTATION,
} from "./FileExplorer.queries";
import {downloadFile} from "../../../services/download";
import JSZip from "jszip";
import {getData} from "../../../services/token";
import SimpleModal, {SimpleModalData} from "../modals/SimpleModal";
import InfoModal, {InfoModalData} from "../modals/InfoModal";
import timestamp from "time-stamp";

export const EntryActionsContext = createContext({
	onDelete: (arg?: Entry) => {},
	onDownload: (arg?: Entry) => {},
	onRename: (arg?: Entry) => {},
	onShare: (arg?: Entry) => {},
	onMoveTo: (arg?: Entry) => {},
	onPreview: (arg?: Entry) => {},
	onRestore: (arg?: Entry) => {},
	onFullyDelete: (arg?: Entry) => {},
	onInfo: (arg?: Entry) => {},
});

export const CategoryContext = createContext({
	dataGetterMap: {} as { [key: string]: () => DataElement[] },
	selected: {} as { [key: string]: boolean[] },
	setSelected: (arg: { [key: string]: boolean[] }) => {},
});

type FileExplorerProps = {
	path: string;
	openCreateContextMenu: (e: MouseEvent) => any;
	loadingIds: Map<number, number>;
	imagePreviews: { [key: number]: Blob };
	refetchMainQuery: () => void;
}

const FileExplorer = ({path, openCreateContextMenu, loadingIds, imagePreviews, refetchMainQuery}: FileExplorerProps) => {
	const {setIsContextMenuOpen} = useContext(ContextMenuContext);
	const {folders, sharedFolders, currentFolderId, currentEntries} = useContext(CurrentDataContext);
	const {writeEntriesToCache} = useContext(CacheContext);

	const [getPresignedUrlsQuery] = useLazyQuery(GET_PRESIGNED_URLS_QUERY);
	const [getEntryQuery] = useLazyQuery(GET_ENTRY_QUERY);
	const [getEntriesSharePolicyQuery] = useLazyQuery(GET_ENTRIES_SHARE_POLICY_QUERY);
	const [getUsernamesQuery] = useLazyQuery(GET_USERNAMES_QUERY);
	const [getEntryOwnerUsernameQuery] = useLazyQuery(GET_ENTRY_OWNER_USERNAME_QUERY);
	const [putEntriesInBinMutation] = useMutation(PUT_ENTRIES_IN_BIN_MUTATION);
	const [restoreEntriesMutation] = useMutation(RESTORE_ENTRIES_MUTATION);
	const [fullyDeleteEntriesMutation] = useMutation(FULLY_DELETE_ENTRIES_MUTATION);

	const [shareEntriesModalData, setShareEntriesModalData] = useState<ShareEntriesModalData>(null);
	const [moveEntriesModalData, setMoveEntriesModalData] = useState<MoveEntriesModalData>(null);
	const [renameEntryModalData, setRenameEntryModalData] = useState<RenameEntryModalData>(null);
	const [simpleModalData, setSimpleModalData] = useState<SimpleModalData | null>(null);
	const [infoModalData, setInfoModalData] = useState<InfoModalData | null>(null);

	const [imagePreviewData, setImagePreviewData] = useState<Entry | null>(null);
	const [selected, setSelected] = useState<{ [key: string]: boolean[] }>({});

	const location = useLocation();

	useEffect(() => {
		setSelected({});
	}, [location]);


	const sortEntries = (a: { entry: Entry }, b: { entry: Entry }): number => {
		const getNumAndName = (name: string): [string, number] => {
			const numOpt = name.match(/\((\d+)\)(?:\..*)?/);
			const num = numOpt === null ? null : Number(numOpt[1]);
			const [cleanName, cleanExt] = splitName(name);

			return [cleanExt ? `${cleanName}.${cleanExt}` : cleanName, num || 0];
		};

		const [aName, aNum] = getNumAndName(a.entry.name);
		const [bName, bNum] = getNumAndName(b.entry.name);

		return aName.localeCompare(bName) || aNum - bNum;
	};

	const getFolderData = (): DataElement[] => {
		return currentEntries.filter(entry => entry.is_directory).map(folder => (
			{entry: folder, key: String(folder.id), isLoading: (loadingIds.get(folder.id) || 0) > 0, binData: folder.bin_data, canEdit: folder.can_edit}
		)).sort(sortEntries);
	};

	const getFileData = (): DataElement[] => {
		return currentEntries.filter(entry => !entry.is_directory).map(file => {
			const [, extension] = splitName(file.name);
			const type = extension ? getFileType(extension.slice(1)) : EFileType.OTHER;
			const imagePreview = type === EFileType.IMAGE ? imagePreviews[file.id] : null;

			return {entry: file, key: String(file.id), type, isLoading: (loadingIds.get(file.id) || 0) > 0, imagePreview, binData: file.bin_data, canEdit: file.can_edit};
		}).sort(sortEntries);
	};

	const categoryNameToDataGetter = {"Folders": getFolderData, "Files": getFileData};

	const getSelectedNum = (): number => {
		const values = Object.values(selected);

		return values.reduce((prev: number, cur: boolean[]) => {
			const currentNum = cur.reduce((prev: number, cur: boolean) => prev + (cur ? 1 : 0), 0);
			return prev + currentNum;
		}, 0);
	};

	const onClick = () => {
		setIsContextMenuOpen(false);
		if (getSelectedNum() > 0) setSelected({});
	};

	const getNavigationActionType = (): ENavigationType => {
		const selectedNum = getSelectedNum();

		if (selectedNum === 1) return ENavigationType.SINGLE;
		else return selectedNum < 1 ? ENavigationType.HIDDEN : ENavigationType.MULTIPLE;
	};

	const getSelectedEntries = (): Entry[] => {
		const selectionIndexes = Object.entries(selected).map(([k, v]) => {
			const selectedIndexes = v.map((cur, i) => cur ? i : null).filter(cur => cur !== null);
			if (!selectedIndexes) return null;

			return [k, selectedIndexes];
		}).filter(cur => cur !== null) as [key: string, indexes: number[]][];

		const ids = selectionIndexes.map(([key, indexes]) => {
			if (key === "Files") return indexes.map(i => Number(getFileData()[i].key));
			if (key === "Folders") return indexes.map(i => Number(getFolderData()[i].key));
			return null;
		}).reduce((arr: number[], cur) => [...arr, ...(cur || [])], []);

		return currentEntries.filter(({id}) => ids.includes(id));
	};

	const getEntries = (entry?: Entry): Entry[] => {
		const selectedEntries = getSelectedEntries();
		if (selectedEntries.length === 0 && !entry) return [];

		return selectedEntries.length === 0 ? [entry as Entry] : selectedEntries;
	};

	const timestampToDate = (timestampMs: number): string => timestamp("HH:MM DD/MM/YYYY", new Date(timestampMs));


	const onDelete = (entry?: Entry) => {
		const onAction = async (isConfirmed: boolean) => {
			setSimpleModalData(null);
			if (!isConfirmed) return;

			const entries = getEntries(entry);

			const {data} = await putEntriesInBinMutation({variables: {entries: entries.map(entry => ({id: entry.id, parent_id: entry.parent_id, name: entry.name}))}});
			if (!data || !data.putEntriesInBin) return;

			const removedIds = entries.map(entry => entry.id);
			const remainingEntries = currentEntries.filter(entry => !removedIds.includes(entry.id));

			writeEntriesToCache(remainingEntries, false);
			refetchMainQuery();

			const {data: {entryOwnerUsername}} = await getEntryOwnerUsernameQuery({variables: {file_id: entries[0].id}});
			if (!entryOwnerUsername || entryOwnerUsername !== getData()?.id) return;

			writeEntriesToCache(entries, false, getData()?.bin_id);
		};

		setSimpleModalData({title: "Are you sure?", info: "Files will be moved to bin and deleted in 3 days.", onAction});
	};

	const onDownload = async (entry?: Entry) => {
		const entries = getEntries(entry);
		const {data} = await getPresignedUrlsQuery({variables: {file_ids: entries.map(entry => entry.id)}});
		if (!data) return;

		const results = data.entriesPresignedUrls as ({ file_id: number, url: string, name: string, parent_id: number, is_directory: boolean }[] | null);
		if (!results || results.length === 0) return;

		if (results.length === 1 && !entries[0].is_directory) {
			const res = await fetch(results[0].url);
			if (res.status !== 200) return;

			const blob = await res.blob();
			downloadFile(blob, entries[0].name);

			return;
		}

		const zip = new JSZip();
		const idToFolder = new Map<number, JSZip>();

		await Promise.all(
			results.map(async ({file_id, is_directory, name, parent_id, url}) => {
				const parent = idToFolder.get(parent_id) || zip;

				if (!is_directory) {
					const res = await fetch(url);
					if (res.status !== 200) return;

					const data = await res.blob();
					parent.file(name, data);

					return;
				}

				const folder = parent.folder(name);
				if (folder === null) return;

				idToFolder.set(file_id, folder);
			}));

		const blob = await zip.generateAsync({type: "blob"});
		downloadFile(blob, "Files");
	};

	const onRename = (entry?: Entry) => setRenameEntryModalData({entry: getEntries(entry)[0], input: null});

	const onShare = async (entry?: Entry) => {
		const arePoliciesDifferent = (...policies: { [key: string]: number[] }[]): boolean => {
			if (policies.length === 1) return false;

			const rl = [];
			const el = [];
			for (let i = 0; i < policies.length; i++) {
				const {can_read_users, can_edit_users} = policies[i];
				if (rl.length === 0 && el.length === 0) {
					rl.push(...can_read_users);
					el.push(...can_edit_users);
					continue;
				}

				if (rl.length !== can_read_users.length || el.length !== can_edit_users.length) return true;
				for (let j = 0; j < rl.length; j++) if (rl[j] !== can_read_users[j]) return true;
				for (let j = 0; j < el.length; j++) if (el[j] !== can_edit_users[j]) return true;
			}

			return false;
		};

		const entries = getEntries(entry);
		const entry_ids = entries.map(entry => entry.id);
		const {data} = await getEntriesSharePolicyQuery({variables: {entry_ids}});
		if (!data.entriesSharePolicies) return;

		if (data.entriesSharePolicies.length === 0) {
			setShareEntriesModalData({entries, users: []});
			return;
		}

		if (arePoliciesDifferent(...data.entriesSharePolicies)) {
			const onAction = (isConfirmed: boolean) => {
				setSimpleModalData(null);
				if (!isConfirmed) return;

				setShareEntriesModalData({entries, users: []});
			};

			setSimpleModalData({title: "Sharing files", info: "Selected files have different sharing policies. Do you want to create new one for all of them?", onAction});
			return;
		}

		const policies = data.entriesSharePolicies[0];
		const user_ids = [...policies.can_edit_users, ...policies.can_read_users];
		const {data: usernamesData} = await getUsernamesQuery({variables: {user_ids}});
		if (!usernamesData.usernames) return;

		const idToUsername = new Map<number, string>();
		const usernamesIdArray: { username: string, id: number }[] = usernamesData.usernames;
		usernamesIdArray.forEach(({username, id}) => idToUsername.set(id, username));

		const usernames = new Set<string>();
		const users: User[] = [];
		policies.can_edit_users.forEach((id: number) => {
			const username = idToUsername.get(id) || "";
			if (usernames.has(username)) return;

			usernames.add(username);
			users.push({username, canEdit: true});
		});
		policies.can_read_users.forEach((id: number) => {
			const username = idToUsername.get(id) || "";
			if (usernames.has(username)) return;

			usernames.add(username);
			users.push({username, canEdit: false});
		});

		setShareEntriesModalData({entries, users});
	};

	const onMoveTo = (entry?: Entry) => {
		const editableSharedFolders = sharedFolders.filter(folder => folder.can_edit);
		const drivePath = getFolderPath(folders, currentFolderId);
		const sharedPath = getFolderPath(editableSharedFolders, currentFolderId);
		const name = sharedPath ? editableSharedFolders.filter(folder => folder.id === currentFolderId)[0].username : "";

		const path = drivePath ? `Drive${drivePath}` : sharedPath ? `Shared/${name}${sharedPath}` : "Drive";
		setMoveEntriesModalData({entries: getEntries(entry), input: path});
	};

	const onPreview = (entry?: Entry) => setImagePreviewData(getEntries(entry)[0]);

	const onFullyDelete = (entry?: Entry) => {
		const onAction = async (isConfirmed: boolean) => {
			setSimpleModalData(null);
			if (!isConfirmed) return;

			const entries = getEntries(entry);
			const removedIds = entries.map(entry => entry.id);
			const {data} = await fullyDeleteEntriesMutation({variables: {entry_ids: removedIds}});
			if (!data.fullyDeleteEntries) return;

			const remainingEntries = currentEntries.filter(entry => !removedIds.includes(entry.id));
			writeEntriesToCache(remainingEntries, false);
		};

		setSimpleModalData({title: "Are you sure?", info: "Files will be deleted and cannot be restored.", onAction});
	};

	const onRestore = async (entry?: Entry) => {
		const onAction = async (isConfirmed: boolean, option?: number) => {
			setSimpleModalData(null);
			if (!isConfirmed) return;

			const entries = getEntries(entry);
			const restore_to_drive = option === 1; // Option 0 - prev location, 1 - drive.
			const restoredIds = entries.map(entry => entry.id);
			const {data} = await restoreEntriesMutation({variables: {entry_ids: restoredIds, restore_to_drive}});
			if (!data.restoreEntries) return;
			// refetch sidebar - main query?

			const remainingEntries = currentEntries.filter(entry => !restoredIds.includes(entry.id));
			const drive_id = getData()?.drive_id;

			writeEntriesToCache(remainingEntries, false);
			writeEntriesToCache(entries, true, drive_id);
			refetchMainQuery();
		};

		setSimpleModalData({title: "Where you want to restore files to?", onAction, buttons: ["Previous location", "Drive"]});
	};

	const onInfo = async (entry?: Entry) => {
		const entries = getEntries(entry);
		if (entries.length !== 1) return;

		const {name, bin_data} = entries[0];
		if (!bin_data) return;
		const {put_at, prev_parent_id} = bin_data;
		const deletionTimestamp = Number(put_at) + 3 * 24 * 60 * 60 * 1000;
		const parentFolder = prev_parent_id === getData()?.drive_id ? "Drive" : (await getEntryQuery({variables: {id: prev_parent_id}})).data?.entry?.name;

		setInfoModalData({
			title: `"${name}" info`,
			list: {
				"Put in bin at": timestampToDate(Number(put_at)),
				"Will be deleted at": timestampToDate(deletionTimestamp),
				"Parent folder": parentFolder,
			},
		});
	};


	const navigationType = getNavigationActionType();
	const canEditSelectedEntries = getSelectedEntries().reduce((res, cur) => res ? !!cur.can_edit : false, true);
	const canPreviewSelectedEntry = navigationType === ENavigationType.SINGLE ? getFileType((splitName(getSelectedEntries()[0].name)[1] || "").slice(1)) === EFileType.IMAGE : false;

	return (
		<Main onClick={onClick}>
			<ShareEntriesModal setModalData={setShareEntriesModalData as any} modalData={shareEntriesModalData}/>
			<MoveEntriesModal setModalData={setMoveEntriesModalData as any} modalData={moveEntriesModalData}/>
			<RenameEntryModal setModalData={setRenameEntryModalData as any} modalData={renameEntryModalData}/>
			<SimpleModal modalData={simpleModalData}/>
			<InfoModal modalData={infoModalData} setModalData={setInfoModalData}/>
			<PreviewOverlay setIsOpen={setImagePreviewData as any} data={imagePreviewData}/>

			<EntryActionsContext.Provider value={{onDelete, onDownload, onRename, onShare, onMoveTo, onPreview, onFullyDelete, onRestore, onInfo}}>
				<Navigation path={path} navigationType={navigationType} inBin={path === "Bin"} canEdit={canEditSelectedEntries} canPreview={canPreviewSelectedEntry}/>
				<Column onContextMenu={openCreateContextMenu}>
					<CategoryContext.Provider value={{dataGetterMap: categoryNameToDataGetter, selected, setSelected}}>
						<Category name="Folders" Element={Folder}/>
						<Category name="Files" Element={File}/>
					</CategoryContext.Provider>
				</Column>
			</EntryActionsContext.Provider>
		</Main>
	);
};

export default FileExplorer;