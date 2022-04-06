import React, {createContext, MouseEvent, useState} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar/Sidebar";
import Navigation, {EActionType} from "./Navigation";
import Category from "./Category/Category";
import {Column, Main, Page, Row} from "./index.styles";
import File, {EFileType} from "./Category/File";
import ContextMenu, {ContextMenuOption, ContextMenuProps} from "components/ContextMenu";
import Folder from "./Category/Folder";
import contextMenuOptionsFactory, {EContextMenuTypes} from "services/contextMenuOptionFactory";
import useTitle from "components/useTitle";

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

const MainPage = () => {
	const [selected, setSelected] = useState<{ [key: string]: boolean[] }>({});
	const [isSidebarShown, setIsSidebarShown] = useState(false);
	const [contextMenuProps, setContextMenuProps] = useState<ContextMenuProps>({});
	const [isContextMenuOpened, setIsContextMenuOpened] = useState(false);

	useTitle("PATH");


	const getSelectedNum = (): number => {
		const values = Object.values(selected);

		return values.reduce((prev: number, cur: boolean[]) => {
			const currentNum = cur.reduce((prev: number, cur: boolean) => prev + (cur ? 1 : 0), 0);
			return prev + currentNum;
		}, 0);
	};

	const openContextMenu = (e: MouseEvent, contextMenuData: object, contextMenuType: EContextMenuTypes, width?: number) => {
		const options: ContextMenuOption[] | null = contextMenuOptionsFactory(contextMenuType, contextMenuData);
		if (!options) throw new Error("Invalid context menu.svg type!");

		e.preventDefault();
		e.stopPropagation();

		setContextMenuProps({x: e.pageX, y: e.pageY, options, width});
		setIsContextMenuOpened(true);
	};

	const onNewFolder = () => console.log(1);

	const onUploadFolder = () => console.log(2);

	const onUploadFile = () => console.log(3);

	const onContextMenu = (e: MouseEvent) => openContextMenu(e, {onNewFolder, onUploadFolder, onUploadFile}, EContextMenuTypes.CREATE);

	const onClick = (e: MouseEvent) => {
		setIsContextMenuOpened(false);
		if (selectedNum > 0) setSelected({});
	};


	const selectedNum: number = getSelectedNum();
	const navigationActionType: EActionType = selectedNum === 0 ? EActionType.HIDDEN : selectedNum === 1 ? EActionType.SINGLE : EActionType.MULTIPLE;

	return (
		<Page onContextMenu={() => setIsContextMenuOpened(false)}>
			<Header username="Test username"/>

			<ContextMenu {...contextMenuProps} isOpened={isContextMenuOpened} onClick={() => setIsContextMenuOpened(false)}/>
			<ContextMenuContext.Provider value={{openContextMenu}}>
				<Row onClick={onClick}>
					<SidebarContext.Provider value={{isSidebarShown, setIsSidebarShown}}>
						<Sidebar/>
						<Main>
							<Navigation path={["Root", "Folder"]} actionType={navigationActionType}/>
							<SelectedContext.Provider value={{selected, setSelected}}>
								<Column onContextMenu={onContextMenu}>
									<Category name="Folders" Element={Folder} data={folderData}/>
									<Category name="Files" Element={File} data={fileData}/>
								</Column>
							</SelectedContext.Provider>
						</Main>
					</SidebarContext.Provider>
				</Row>
			</ContextMenuContext.Provider>
		</Page>
	);
};

export default MainPage;