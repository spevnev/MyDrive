import React, {useContext} from "react";
import {Container, Icons, Row, SidebarMenu} from "./Navigation.styles";
import {ReactComponent as LinkIcon} from "assets/link.svg";
import {ReactComponent as ShareIcon} from "assets/share.svg";
import {ReactComponent as DownloadIcon} from "assets/download.svg";
import {ReactComponent as BinIcon} from "assets/bin.svg";
import menuIcon from "assets/menu.svg";
import {SidebarContext} from "../index";
import Path from "./Path";

export enum EActionType {
	HIDDEN,
	SINGLE,
	MULTIPLE
}

type NavigationProps = {
	path: string;
	actionType: EActionType;
}

const Navigation = ({path = "", actionType = EActionType.HIDDEN}: NavigationProps) => {
	const {isSidebarShown, setIsSidebarShown} = useContext<any>(SidebarContext);

	return (
		<Container>
			<Row>
				<SidebarMenu src={menuIcon} className={isSidebarShown ? "shown" : ""} onClick={() => setIsSidebarShown(!isSidebarShown)}/>
				<Path path={path}/>
			</Row>

			{actionType !== 0 &&
				<Icons onClick={e => e.stopPropagation()}>
					{actionType === 1 ?
						<>
							<LinkIcon/>
							<ShareIcon/>
							<DownloadIcon/>
							<BinIcon/>
						</> : <>
							<DownloadIcon/>
							<BinIcon/>
						</>
					}
				</Icons>
			}
		</Container>
	);
};

export default Navigation;