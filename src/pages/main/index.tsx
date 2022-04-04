import React, {createContext, MouseEvent, useState} from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Navigation, {EActionType} from "./Navigation";
import Category from "./Category";
import {Column, Main, Page, Row} from "./index.styles";
import File from "./File";
import ContextMenu, {ContextMenuOption, ContextMenuProps} from "../../components/ContextMenu";

export const ContextMenuContext = createContext({});

const MainPage = () => {
	const [contextMenuProps, setContextMenuProps] = useState<ContextMenuProps>({});
	const [isContextMenuOpened, setIsContextMenuOpened] = useState(false);
	const [selected, setSelected] = useState<boolean[]>([]);


	const openContextMenu = (x: number, y: number, options: ContextMenuOption[]) => {
		setContextMenuProps({x, y, options});
		setIsContextMenuOpened(true);
	};

	const onClick = (e: MouseEvent) => {
		setIsContextMenuOpened(false);
		setSelected([]);
	};


	const selectedNum: number = selected.reduce((prev: number, cur: boolean) => prev + (cur ? 1 : 0), 0);
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

						<Column>
							{/*<Category name="Folders" Element={} data={[]}/>*/}
							<Category selected={selected} setSelected={setSelected} name="Files" Element={File} data={[
								{key: "first", filename: "Filename that spans over three lines", type: "IMAGE"},
								{key: "third", filename: "Filename", type: "WORD"},
								{key: "fourth", filename: "Filename asd", type: "EXCEL"},
								{key: "fifth", filename: "Video", type: "VIDEO"},
								{key: "sixth", filename: "Something.unknown", type: "test"},
								{key: "seventh", filename: "test.mp4", type: "MUSIC"},
								{key: "a", filename: "Filename that spans over three lines", type: "IMAGE"},
								{key: "b", filename: "Filename", type: "WORD"},
								{key: "c", filename: "Filename asd", type: "EXCEL"},
								{key: "d", filename: "Video", type: "VIDEO"},
								{key: "e", filename: "Something.unknown", type: "test"},
								{key: "f", filename: "test.mp4", type: "MUSIC"},
								{key: "1", filename: "Filename that spans over three lines", type: "IMAGE"},
								{key: "2", filename: "Filename", type: "WORD"},
								{key: "3", filename: "Filename asd", type: "EXCEL"},
								{key: "4", filename: "Video", type: "VIDEO"},
								{key: "5", filename: "Something.unknown", type: "test"},
								{key: "6", filename: "test.mp4", type: "MUSIC"},
							]}/>
						</Column>
					</Main>
				</Row>
			</ContextMenuContext.Provider>
		</Page>
	);
};

export default MainPage;