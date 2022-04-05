import React, {createContext, MouseEvent, useState} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Navigation, {EActionType} from "./Navigation";
import Category from "./Category";
import {Column, Main, Page, Row} from "./index.styles";
import File, {EFileType} from "./File";
import ContextMenu, {ContextMenuOption, ContextMenuProps} from "../../components/ContextMenu";
import Folder from "./Folder";
import contextMenuOptionsFactory, {EContextMenuOptions} from "../../service/contextMenuOptionFactory";
import useTitle from "../../components/useTitle";

export const ContextMenuContext = createContext({});
export const SelectedContext = createContext({});

const MainPage = () => {
	const [contextMenuProps, setContextMenuProps] = useState<ContextMenuProps>({});
	const [isContextMenuOpened, setIsContextMenuOpened] = useState(false);
	const [selected, setSelected] = useState<{ [key: string]: boolean[] }>({});

	useTitle("PATH");


	const getSelectedNum = (): number => {
		const values = Object.values(selected);

		return values.reduce((prev: number, cur: boolean[]) => {
			const currentNum = cur.reduce((prev: number, cur: boolean) => prev + (cur ? 1 : 0), 0);
			return prev + currentNum;
		}, 0);
	};

	const openContextMenu = (e: MouseEvent, contextMenuData: object, contextMenuType: EContextMenuOptions) => {
		const options: ContextMenuOption[] | null = contextMenuOptionsFactory(contextMenuType, contextMenuData);
		if (!options) throw new Error("Invalid context menu type!");

		e.preventDefault();
		e.stopPropagation();

		setContextMenuProps({x: e.pageX, y: e.pageY, options});
		setIsContextMenuOpened(true);
	};

	const onClick = (e: MouseEvent) => {
		setIsContextMenuOpened(false);
		setSelected({});
	};


	const selectedNum: number = getSelectedNum();
	const navigationActionType: EActionType = selectedNum === 0 ? EActionType.HIDDEN : selectedNum === 1 ? EActionType.SINGLE : EActionType.MULTIPLE;

	return (
		<Page onClick={onClick} onContextMenu={() => setIsContextMenuOpened(false)}>
			<ContextMenu {...contextMenuProps} isOpened={isContextMenuOpened}/>
			<ContextMenuContext.Provider value={{openContextMenu}}>
				<Header username="Test username"/>

				<Row>
					<Sidebar/>
					<Main>
						<Navigation path={["Root", "Folder"]} actionType={navigationActionType}/>

						<SelectedContext.Provider value={{selected, setSelected}}>
							<Column>
								<Category name="Folders" Element={Folder} data={[
									{key: "first", name: "Test"},
									{key: "second", name: "Text"},
									{key: "third", name: "Something"},
									{key: "fourth", name: "Ver long name"},
									{key: "fifth", name: "Directory"},
									{key: "sixth", name: "Name"},
									{key: "seventh", name: "Folder"},
									{key: "eighth", name: "Dir"},
								]}/>
								<Category name="Files" Element={File} data={[
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
								]}/>
							</Column>
						</SelectedContext.Provider>
					</Main>
				</Row>
			</ContextMenuContext.Provider>
		</Page>
	);
};

export default MainPage;