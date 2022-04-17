import React, {createContext, FormEvent, MouseEvent, useState} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar/Sidebar";
import Navigation, {EActionType} from "./Navigation";
import Category, {DataElement} from "./Category/Category";
import {Column, Hidden, Main, Page, Row} from "./index.styles";
import File from "./Category/File";
import useContextMenu from "hooks/useContextMenu";
import Folder from "./Category/Folder";
import {EContextMenuTypes} from "services/contextMenuOptionFactory";
import useTitle from "hooks/useTitle";
import DropZone from "../../components/DropZone";
import usePath from "../../hooks/usePath";
import {filesToEntry, folderToEntries} from "../../services/fileInput";
import {useMutation} from "@apollo/client";
import {UPLOAD_FILES_AND_FOLDERS_MUTATION, UPLOAD_FILES_MUTATION} from "./index.queries";

export const ContextMenuContext = createContext({});
export const SelectedContext = createContext({});
export const SidebarContext = createContext({});

let timeout: NodeJS.Timeout | null = null;
const MainPage = () => {
	const [selected, setSelected] = useState<{ [key: string]: boolean[] }>({});
	const [isSidebarShown, setIsSidebarShown] = useState(false);
	const [isDropZoneVisible, setIsDropZoneVisible] = useState(false);
	const [openContextMenu, setIsContextMenuOpened, ContextMenu]: [Function, Function, JSX.Element | null] = useContextMenu();
	const [uploadFilesMutation] = useMutation(UPLOAD_FILES_MUTATION);
	const [uploadFilesAndFoldersMutation] = useMutation(UPLOAD_FILES_AND_FOLDERS_MUTATION);

	const path = window.location.hash.slice(1);
	usePath(path || "Drive");
	useTitle("Drive");


	const getFiles = (e: FormEvent): FileList | null => {
		const target: HTMLElement | null = e.target as HTMLElement;
		if (target === null) return null;

		return (target as HTMLInputElement).files;
	};

	const onFolderInput = (e: FormEvent) => {
		const folderFiles: FileList | null = getFiles(e);
		if (folderFiles === null) return;
		const entries = folderToEntries(folderFiles);

		uploadFilesAndFoldersMutation({
			variables: {
				parent_id: null, // Current folder id
				entries,
			},
		}).then(result => console.log(result));

	};

	const onFileInput = (e: FormEvent) => {
		const files: FileList | null = getFiles(e);
		if (files === null) return;
		const entries = filesToEntry(files);

		uploadFilesMutation({
			variables: {
				parent_id: null, // Current folder id
				entries,
			},
		}).then(result => console.log(result));
	};


	const onNewFolder = () => console.log(1);

	const clickIfExists = (elementId: string) => {
		const element: HTMLElement | null = document.getElementById(elementId);
		if (element) element.click();
	};

	const openCreateContextMenu = (e: MouseEvent) =>
		openContextMenu(e, {onNewFolder, onUploadFolder: () => clickIfExists("folderUpload"), onUploadFile: () => clickIfExists("fileUpload")}, EContextMenuTypes.CREATE);

	const onClick = () => {
		setIsContextMenuOpened(false);
		if (selectedNum > 0) setSelected({});
	};


	const onDrop = (e: any) => {
		e.preventDefault();
		console.log(e.dataTransfer.items);
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


	const folderData: DataElement[] = [];
	const fileData: DataElement[] = [];
	const selectedNum: number = getSelectedNum();
	const navigationActionType: EActionType = selectedNum === 0 ? EActionType.HIDDEN : selectedNum === 1 ? EActionType.SINGLE : EActionType.MULTIPLE;

	return (
		<Page onContextMenu={() => setIsContextMenuOpened(false)} onDrop={onDrop} onDragOver={onDragOver}>
			<Hidden>
				{/* @ts-ignore */}
				<input id="folderUpload" type="file" onInput={onFolderInput} webkitdirectory="true" directory="true"/>
				<input id="fileUpload" type="file" onInput={onFileInput} multiple/>
			</Hidden>
			{isDropZoneVisible && <DropZone/>}

			<Header/>
			<Row onClick={onClick}>
				<SidebarContext.Provider value={{isSidebarShown, setIsSidebarShown}}>
					<Sidebar openCreateContextMenu={openCreateContextMenu}/>
					<Main>
						<Navigation path={path} actionType={navigationActionType}/>
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
				</SidebarContext.Provider>
			</Row>
		</Page>
	);
};

export default MainPage;