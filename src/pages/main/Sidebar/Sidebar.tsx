import React, {MouseEvent, useContext} from "react";
import addIcon from "assets/add-solid.svg";
import binIcon from "assets/bin.svg";
import diskIcon from "assets/drive.svg";
import sharedIcon from "assets/share.svg";
import ProgressBar from "components/ProgressBar";
import Entry from "./Entry";
import {Button, Container, Cross, Explorer, Icon, Overlay, ProgressText, Storage, Text} from "./Sidebar.styles";
import {ContextMenuContext, SidebarContext} from "../index";
import {EContextMenuTypes} from "services/contextMenuOptionFactory";

const Sidebar = () => {
	const {openContextMenu} = useContext<any>(ContextMenuContext);
	const {isSidebarShown, setIsSidebarShown} = useContext<any>(SidebarContext);


	const onClick = (e: MouseEvent) => {
		const target: HTMLElement = e.currentTarget as HTMLElement;
		e.pageX = target.offsetLeft;
		e.pageY = target.offsetTop + target.offsetHeight;

		openContextMenu(e, {}, EContextMenuTypes.CREATE, target.offsetWidth);
	};


	const MAX_CAPACITY = 1000; // MB
	const percent = 34;

	return (
		<Overlay className={isSidebarShown ? "" : "hidden"} onClick={() => setIsSidebarShown(false)}>
			<Container>
				<Button onClick={onClick}>
					<Icon src={addIcon}/>
					<Text>Add</Text>
				</Button>

				<Explorer>
					<Entry icon={diskIcon} text="Test" hasChildren={true}>
						<Entry icon={diskIcon} text="Sub entry #1" depth={1}/>
					</Entry>
					<Entry icon={sharedIcon} text="Shared"/>
					<Entry icon={binIcon} text="Bin"/>
				</Explorer>

				<Storage>
					<ProgressBar fillPercent={percent}/>
					<ProgressText>{MAX_CAPACITY * percent / 100}MB of {MAX_CAPACITY / 1000}GB used</ProgressText>
				</Storage>
			</Container>

			<Cross/>
		</Overlay>
	);
};

export default Sidebar;