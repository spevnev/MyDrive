import React, {createContext, MouseEvent, useContext, useEffect, useState} from "react";
import PreviewOverlay from "./PreviewOverlay";
import Navigation, {EActionType} from "../Navigation/Navigation";
import {Column, Main} from "./FileExplorer.styles";
import Category, {DataElement} from "../Category/Category";
import Folder from "../Category/Folder";
import File, {EFileType} from "../Category/File";
import {getFileType} from "helpers/FileType";
import {useLocation} from "react-router-dom";
import {ContextMenuContext, CurrentDataContext, Entry} from "../index";
import ShareEntriesModal, {ShareEntriesModalData} from "../modals/ShareEntriesModal";
import {getFolderPath, splitName} from "services/file/file";
import MoveEntriesModal, {MoveEntriesModalData} from "../modals/MoveEntriesModal";
import RenameEntryModal, {RenameEntryModalData} from "../modals/RenameEntryModal";
import {useLazyQuery, useMutation} from "@apollo/client";
import {GET_PRESIGNED_URLS_QUERY, PUT_ENTRIES_IN_BIN_MUTATION} from "./FileExplorer.queries";
import {downloadFile} from "../../../services/download";
import JSZip from "jszip";
import {client} from "../../../index";
import {CURRENT_FOLDER_QUERY} from "../index.queries";
import {getData} from "../../../services/token";

export const EntryActionsContext = createContext({
	onDelete: (arg?: Entry) => {},
	onDownload: (arg?: Entry) => {},
	onRename: (arg?: Entry) => {},
	onShare: (arg?: Entry) => {},
	onMoveTo: (arg?: Entry) => {},
	onPreview: (arg?: Entry) => {},
});

export const CategoryContext = createContext({
	dataGetterMap: {} as { [key: string]: () => DataElement[] },
	selected: {} as { [key: string]: boolean[] },
	setSelected: (arg: { [key: string]: boolean[] }) => {},
});

type FileExplorerProps = {
	path: string;
	openCreateContextMenu: (e: MouseEvent) => any;
	currentEntries: Entry[];
	loadingIds: Map<number, number>;
	imagePreviews: { [key: number]: Blob };
	setCurrentEntries: (entries: Entry[]) => void;
}

const FileExplorer = ({path, openCreateContextMenu, currentEntries, loadingIds, imagePreviews, setCurrentEntries}: FileExplorerProps) => {
	const {setIsContextMenuOpen} = useContext(ContextMenuContext);
	const {folders, currentFolderId} = useContext(CurrentDataContext);

	const [getPresignedUrlsQuery] = useLazyQuery(GET_PRESIGNED_URLS_QUERY);
	const [putEntriesInBinMutation] = useMutation(PUT_ENTRIES_IN_BIN_MUTATION);

	const [shareEntriesModalData, setShareEntriesModalData] = useState<ShareEntriesModalData>(null);
	const [moveEntriesModalData, setMoveEntriesModalData] = useState<MoveEntriesModalData>(null);
	const [renameEntryModalData, setRenameEntryModalData] = useState<RenameEntryModalData>(null);
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
			{entry: folder, key: String(folder.id), isLoading: (loadingIds.get(folder.id) || 0) > 0, binData: folder.bin_data || null}
		)).sort(sortEntries);
	};

	const getFileData = (): DataElement[] => {
		return currentEntries.filter(entry => !entry.is_directory).map(file => {
			const [, extension] = splitName(file.name);
			const type = extension ? getFileType(extension.slice(1)) : EFileType.OTHER;
			const imagePreview = type === EFileType.IMAGE ? imagePreviews[file.id] : null;

			return {entry: file, key: String(file.id), type, isLoading: (loadingIds.get(file.id) || 0) > 0, imagePreview, binData: file.bin_data || null};
		}).sort(sortEntries);
	};

	const categoryNameToDataGetter = {
		"Folders": getFolderData,
		"Files": getFileData,
	};

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

	const getNavigationActionType = (): EActionType => {
		const selectedNum = getSelectedNum();

		if (selectedNum === 1) return EActionType.SINGLE;
		else return selectedNum < 1 ? EActionType.HIDDEN : EActionType.MULTIPLE;
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


	const onDelete = async (entry?: Entry) => {
		const entries = getEntries(entry);

		const {data} = await putEntriesInBinMutation({variables: {entries: entries.map(entry => ({id: entry.id, parent_id: entry.parent_id, name: entry.name}))}});
		if (!data || !data.putEntriesInBin) return;

		const removedIds = entries.map(entry => entry.id);
		const remainingEntries = currentEntries.filter(entry => !removedIds.includes(entry.id));

		setCurrentEntries(remainingEntries);
		client.writeQuery({
			query: CURRENT_FOLDER_QUERY,
			data: {entries: remainingEntries},
			variables: {parent_id: currentFolderId},
		});

		const bin_id = getData()?.bin_id;
		client.writeQuery({
			query: CURRENT_FOLDER_QUERY,
			data: {entries},
			variables: {parent_id: bin_id},
		});
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

	const onShare = (entry?: Entry) => setShareEntriesModalData({entries: getEntries(entry), users: []});

	const onMoveTo = (entry?: Entry) => setMoveEntriesModalData({entries: getEntries(entry), input: getFolderPath(folders, currentFolderId) || "/"});

	const onPreview = (entry?: Entry) => setImagePreviewData(getEntries(entry)[0]);

	return (
		<Main onClick={onClick}>
			<ShareEntriesModal setModalData={setShareEntriesModalData as any} modalData={shareEntriesModalData}/>
			<MoveEntriesModal setModalData={setMoveEntriesModalData as any} modalData={moveEntriesModalData}
							  setCurrentEntries={setCurrentEntries} currentEntries={currentEntries}/>
			<RenameEntryModal setModalData={setRenameEntryModalData as any} modalData={renameEntryModalData}
							  setCurrentEntries={setCurrentEntries} currentEntries={currentEntries}/>
			<PreviewOverlay setIsOpen={setImagePreviewData as any} data={imagePreviewData}/>

			<EntryActionsContext.Provider value={{onDelete, onDownload, onRename, onShare, onMoveTo, onPreview}}>
				<Navigation path={path} actionType={getNavigationActionType()}/>
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