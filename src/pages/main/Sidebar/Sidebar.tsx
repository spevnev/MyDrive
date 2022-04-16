import React, {MouseEvent, useContext, useEffect} from "react";
import addIcon from "assets/add-solid.svg";
import binIcon from "assets/bin.svg";
import diskIcon from "assets/drive.svg";
import sharedIcon from "assets/share.svg";
import ProgressBar from "components/ProgressBar";
import Entry from "./Entry";
import {Button, Container, Cross, Explorer, Icon, Overlay, ProgressText, Storage, Text} from "./Sidebar.styles";
import {SidebarContext} from "../index";
import {useQuery} from "@apollo/client";
import {SIDEBAR_QUERY} from "./Sidebar.queries";
import {useNavigate} from "react-router-dom";

type SidebarProps = {
	openCreateContextMenu: (e: MouseEvent) => void;
}

const MAX_CAPACITY = 1000; // MB
const Sidebar = ({openCreateContextMenu}: SidebarProps) => {
	const navigate = useNavigate();
	const {loading, error, data} = useQuery(SIDEBAR_QUERY);
	const {isSidebarShown, setIsSidebarShown} = useContext<any>(SidebarContext);

	useEffect(() => {
		if (!loading && !error && !data.user) localStorage.removeItem("JWT");
	}, [data]);


	const onClick = (e: MouseEvent) => {
		const target: HTMLElement = e.currentTarget as HTMLElement;
		e.pageX = target.offsetLeft;
		e.pageY = target.offsetTop + target.offsetHeight;

		openCreateContextMenu(e);
	};


	const spaceUsedPercentage: number = data ? data.user.space_used || 0 : 0;
	const rootFolders: { name: string, id: number }[] = data ? data.folders || [] : [];
	const sharedFolders: { name: string, id: number }[] = data ? data.rootSharedFolders || [] : [];

	return (
		<Overlay className={isSidebarShown ? "" : "hidden"} onClick={() => setIsSidebarShown(false)}>
			<Container>
				<Button onClick={onClick}>
					<Icon src={addIcon}/>
					<Text>Add</Text>
				</Button>

				<Explorer>
					<Entry onClick={() => navigate(`${document.location.pathname}#Drive`)} icon={diskIcon} text="Drive" hasChildren={!!rootFolders.length}>
						{rootFolders.map(folder =>
							<Entry onClick={() => navigate(`${document.location.pathname}#Drive/${folder.name}`)} icon={diskIcon} key={folder.id} text={folder.name} depth={1}/>,
						)}
					</Entry>
					<Entry onClick={() => navigate(`${document.location.pathname}#Shared`)} icon={sharedIcon} text="Shared" hasChildren={!!sharedFolders.length}>
						{sharedFolders.map(folder =>
							<Entry onClick={() => navigate(`${document.location.pathname}#Drive/${folder.name}`)} icon={diskIcon} key={folder.id} text={folder.name} depth={1}/>,
						)}
					</Entry>
					<Entry onClick={() => navigate(`${document.location.pathname}#Bin`)} icon={binIcon} text="Bin"/>
				</Explorer>

				<Storage>
					<ProgressBar fillPercent={spaceUsedPercentage}/>
					<ProgressText>{Math.floor(MAX_CAPACITY * spaceUsedPercentage / 100 * 10) / 10}MB of {MAX_CAPACITY / 1000}GB used</ProgressText>
				</Storage>
			</Container>

			<Cross/>
		</Overlay>
	);
};

export default Sidebar;