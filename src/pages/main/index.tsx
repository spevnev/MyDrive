import React, {createContext, MouseEvent, useEffect, useState} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar/Sidebar";
import Navigation, {EActionType} from "./Navigation/Navigation";
import Category, {DataElement} from "./Category/Category";
import {Column, Main, Page, Row} from "./index.styles";
import File from "./Category/File";
import useContextMenu from "hooks/useContextMenu";
import Folder from "./Category/Folder";
import {EContextMenuTypes} from "helpers/contextMenuOptionFactory";
import useTitle from "hooks/useTitle";
import usePath from "../../hooks/usePath";
import Inputs from "./Inputs";
import {useQuery} from "@apollo/client";
import {GET_FOLDERS_RECURSIVELY_QUERY} from "./index.queries";
import {getFolderByPath} from "../../services/file";
import {getData} from "../../services/token";

export const ContextMenuContext = createContext({});
export const SelectedContext = createContext({});
export const SidebarContext = createContext({});

let timeout: NodeJS.Timeout | null = null;
const MainPage = () => {
	const path = window.location.hash.slice(1);

	const [openContextMenu, setIsContextMenuOpened, ContextMenu] = useContextMenu();
	const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
	const [selected, setSelected] = useState<{ [key: string]: boolean[] }>({});
	const [isSidebarShown, setIsSidebarShown] = useState(false);
	const [isDropZoneVisible, setIsDropZoneVisible] = useState(false);
	const {data} = useQuery(GET_FOLDERS_RECURSIVELY_QUERY);

	usePath(path || "Drive");
	useTitle("Drive");

	useEffect(() => {
		if (!data || !data.folders) return;
		if (path.startsWith("Drive") && path.length > 6) {
			setCurrentFolderId(getFolderByPath(data.folders, path.slice(6)));
		} else {
			const tokenData = getData();
			if (!tokenData) return;
			setCurrentFolderId(tokenData.drive_id);
		}
	}, [data]);


	const onNewFolder = () => console.log(1);

	const clickIfExists = (elementId: string) => {
		const element: HTMLElement | null = document.getElementById(elementId);
		if (element) element.click();
	};

	const contextMenuData = {onNewFolder, onUploadFolder: () => clickIfExists("folderUpload"), onUploadFile: () => clickIfExists("fileUpload")};
	const openCreateContextMenu = (e: MouseEvent) => openContextMenu(e, contextMenuData, EContextMenuTypes.CREATE);

	const onClick = () => {
		setIsContextMenuOpened(false);
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


	const folderData: DataElement[] = [];
	const fileData: DataElement[] = [];
	const selectedNum: number = getSelectedNum();
	const navigationActionType: EActionType = selectedNum === 0 ? EActionType.HIDDEN : selectedNum === 1 ? EActionType.SINGLE : EActionType.MULTIPLE;

	return (
		<Page onContextMenu={() => setIsContextMenuOpened(false)} onDragOver={onDragOver}>
			<Inputs setIsDropZoneVisible={setIsDropZoneVisible} isDropZoneVisible={isDropZoneVisible} currentFolderId={currentFolderId} folders={data ? data.folders : null}/>

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