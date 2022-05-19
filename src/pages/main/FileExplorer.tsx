import React, {createContext, MouseEvent, useContext, useEffect, useState} from "react";
import Navigation, {EActionType} from "./Navigation/Navigation";
import {Column, Main} from "./FileExplorer.styles";
import Category, {DataElement} from "./Category/Category";
import Folder from "./Category/Folder";
import File, {EFileType} from "./Category/File";
import {getFileType} from "../../helpers/FileType";
import {useLocation} from "react-router-dom";
import {ContextMenuContext, Entry} from "./index";
import ShareEntriesModal, {ModalData} from "./modals/ShareEntriesModal";
import {splitName} from "../../services/file/file";

export const EntryActionsContext = createContext({
	onDelete: () => {},
	onDownload: () => {},
	onRename: () => {},
	onShare: (arg?: Entry) => {},
	onMoveTo: () => {},
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
}

const FileExplorer = ({path, openCreateContextMenu, currentEntries, loadingIds, imagePreviews}: FileExplorerProps) => {
	const {setIsContextMenuOpen} = useContext(ContextMenuContext);

	const [shareEntriesModalData, setShareEntriesModalData] = useState<ModalData>(null);
	const [selected, setSelected] = useState<{ [key: string]: boolean[] }>({});

	const location = useLocation();

	useEffect(() => {
		setSelected({});
	}, [location]);


	const getFolderData = (): DataElement[] => {
		return currentEntries.filter(entry => entry.is_directory).map(folder => (
			{entry: folder, key: String(folder.id), isLoading: (loadingIds.get(folder.id) || 0) > 0}
		)).sort((a, b) => a.entry.name.localeCompare(b.entry.name));
	};

	const getFileData = (): DataElement[] => {
		return currentEntries.filter(entry => !entry.is_directory).map(file => {
			const [, extension] = splitName(file.name);
			const type = extension ? getFileType(extension.slice(1)) : EFileType.OTHER;
			const imagePreview = type === EFileType.IMAGE ? imagePreviews[file.id] : null;

			return {entry: file, key: String(file.id), type, isLoading: (loadingIds.get(file.id) || 0) > 0, imagePreview};
		}).sort((a, b) => a.entry.name.localeCompare(b.entry.name));
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

	const onDelete = () => {};

	const onDownload = () => {};

	const onRename = () => {};

	const onShare = (entry?: Entry) => {
		const selectedEntries = getSelectedEntries();
		if (!selectedEntries && !entry) return;

		const entries = selectedEntries.length <= 0 ? [entry as Entry] : selectedEntries;
		setShareEntriesModalData({entries, users: []});
	};

	const onMoveTo = () => {};

	const onPreview = () => {};


	return (
		<Main onClick={onClick}>
			<ShareEntriesModal setModalData={setShareEntriesModalData as any} modalData={shareEntriesModalData}/>

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