import React, {createContext, FormEvent, MouseEvent, useEffect, useState} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar/Sidebar";
import Navigation, {EActionType} from "./Navigation";
import Category from "./Category/Category";
import {Column, Hidden, Main, Page, Row} from "./index.styles";
import File, {EFileType} from "./Category/File";
import useContextMenu from "hooks/useContextMenu";
import Folder from "./Category/Folder";
import {EContextMenuTypes} from "services/contextMenuOptionFactory";
import useTitle from "hooks/useTitle";
import DropZone from "../../components/DropZone";
import {gql, useQuery} from "@apollo/client";

export const ContextMenuContext = createContext({});
export const SelectedContext = createContext({});
export const SidebarContext = createContext({});

const fileData = [
	{key: "first", filename: "Filename that spans over three lines", type: EFileType.IMAGE},
	{key: "third", filename: "Filename", type: EFileType.WORD},
	{key: "sixth", filename: "Something.unknown", type: null},
	{key: "seventh", filename: "test.mp4", type: EFileType.MUSIC},
	{key: "a", filename: "Filename that spans over three lines", type: EFileType.IMAGE},
	{key: "b", filename: "Filename", type: EFileType.TEXT},
	{key: "c", filename: "Filename asd", type: EFileType.EXCEL},
	{key: "d", filename: "Video", type: EFileType.VIDEO},
	{key: "f", filename: "test.mp4", type: EFileType.MUSIC},
	{key: "1", filename: "three", type: EFileType.COMPRESSED},
	{key: "2", filename: "Filename", type: EFileType.VIDEO},
	{key: "3", filename: "Filename asd", type: EFileType.EXCEL},
	{key: "4", filename: "Video", type: EFileType.VIDEO},
	{key: "5", filename: "Something", type: null},
	{key: "6", filename: "test", type: EFileType.PDF},
];

const folderData = [
	{key: "first", name: "Test"},
	{key: "second", name: "Text"},
	{key: "third", name: "Something"},
	{key: "fourth", name: "Ver long name"},
	{key: "fifth", name: "Directory"},
	{key: "sixth", name: "Name"},
	{key: "seventh", name: "Folder"},
	{key: "eighth", name: "Dir"},
];

let timeout: NodeJS.Timeout | null = null;
const MainPage = () => {
	const [selected, setSelected] = useState<{ [key: string]: boolean[] }>({});
	const [isSidebarShown, setIsSidebarShown] = useState(false);
	const [isDropZoneVisible, setIsDropZoneVisible] = useState(false);
	const [openContextMenu, setIsContextMenuOpened, ContextMenu]: [Function, Function, JSX.Element | null] = useContextMenu();

	useTitle("PATH");


	const getSelectedNum = (): number => {
		const values = Object.values(selected);

		return values.reduce((prev: number, cur: boolean[]) => {
			const currentNum = cur.reduce((prev: number, cur: boolean) => prev + (cur ? 1 : 0), 0);
			return prev + currentNum;
		}, 0);
	};

	const onNewFolder = () => console.log(1);

	const onUploadFolder = () => {
		const input: HTMLElement | null = document.getElementById("folderUpload");
		if (input) input.click();
	};

	const onUploadFile = () => {
		const input: HTMLElement | null = document.getElementById("fileUpload");
		if (input) input.click();
	};

	const getFiles = (e: FormEvent): FileList | null => {
		const target: HTMLElement | null = e.target as HTMLElement;
		if (target === null) return null;

		return (target as HTMLInputElement).files;
	};

	const onFolderInput = (e: FormEvent) => {
		const files: FileList | null = getFiles(e);
		if (files === null) return;

		console.log(files);
	};

	const onFileInput = (e: FormEvent) => {
		const files: FileList | null = getFiles(e);
		if (files === null) return;

		console.log(files);
	};

	const openCreateContextMenu = (e: MouseEvent) => openContextMenu(e, {onNewFolder, onUploadFolder, onUploadFile}, EContextMenuTypes.CREATE);

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
						<Navigation path={["Root", "Folder"]} actionType={navigationActionType}/>
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