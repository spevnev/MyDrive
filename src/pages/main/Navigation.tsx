import React from "react";
import {Container, Icons, Path} from "./Navigation.styles";
import {Link} from "react-router-dom";
import {ReactComponent as LinkIcon} from "../../assets/link.svg";
import {ReactComponent as ShareIcon} from "../../assets/share.svg";
import {ReactComponent as DownloadIcon} from "../../assets/download.svg";
import {ReactComponent as BinIcon} from "../../assets/bin.svg";

export enum EActionType {
	HIDDEN,
	SINGLE,
	MULTIPLE
}

type NavigationProps = {
	path: string[];
	actionType: EActionType;
}

const Navigation = ({path = [], actionType = EActionType.HIDDEN}: NavigationProps) => {
	return (
		<Container>
			<Path>
				{path.map((text, i) =>
					<React.Fragment key={i}>
						<Link to="">{text}</Link>
						{i + 1 !== path.length && <span>/</span>}
					</React.Fragment>,
				)}
			</Path>

			{actionType !== 0 &&
				<Icons>
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