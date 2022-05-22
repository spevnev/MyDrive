import React, {createContext, MouseEvent, useContext, useEffect, useState} from "react";
import Navigation, {EActionType} from "./Navigation/Navigation";
import {Column, Main} from "./FileExplorer.styles";
import Category, {DataElement} from "./Category/Category";
import Folder from "./Category/Folder";
import File, {EFileType} from "./Category/File";
import {getFileType} from "../../helpers/FileType";
import {useLocation} from "react-router-dom";
import {ContextMenuContext, CurrentDataContext, Entry} from "./index";
import ShareEntriesModal, {ShareEntriesModalData} from "./modals/ShareEntriesModal";
import {getFolderPath, splitName} from "../../services/file/file";
import MoveEntriesModal, {MoveEntriesModalData} from "./modals/MoveEntriesModal";

export const EntryActionsContext = createContext({
	onDelete: () => {},
	onDownload: () => {},
	onRename: () => {},
	onShare: (arg?: Entry) => {},
	onMoveTo: (arg?: Entry) => {},
	onPreview: () => {},
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

	const [shareEntriesModalData, setShareEntriesModalData] = useState<ShareEntriesModalData>(null);
	const [moveEntriesModalData, setMoveEntriesModalData] = useState<MoveEntriesModalData>(null);

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
			{entry: folder, key: String(folder.id), isLoading: (loadingIds.get(folder.id) || 0) > 0}
		)).sort(sortEntries);
	};

	const getFileData = (): DataElement[] => {
		return currentEntries.filter(entry => !entry.is_directory).map(file => {
			const [, extension] = splitName(file.name);
			const type = extension ? getFileType(extension.slice(1)) : EFileType.OTHER;
			const imagePreview = type === EFileType.IMAGE ? imagePreviews[file.id] : null;

			return {entry: file, key: String(file.id), type, isLoading: (loadingIds.get(file.id) || 0) > 0, imagePreview};
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


	const onDelete = () => {}; //

	const onDownload = () => {}; // file - easy, folder - need to create a zip/rar

	const onRename = () => {}; // easy

	const onShare = (entry?: Entry) => setShareEntriesModalData({entries: getEntries(entry), users: []});

	const onMoveTo = (entry?: Entry) => setMoveEntriesModalData({entries: getEntries(entry), input: getFolderPath(folders, currentFolderId) || "/"});

	const onPreview = () => {};


	return (
		<Main onClick={onClick}>
			<ShareEntriesModal setModalData={setShareEntriesModalData as any} modalData={shareEntriesModalData}/>
			<MoveEntriesModal setModalData={setMoveEntriesModalData as any} modalData={moveEntriesModalData}
							  setCurrentEntries={setCurrentEntries} currentEntries={currentEntries}/>

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