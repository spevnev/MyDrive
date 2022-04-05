import React, {useState} from "react";
import dropDownIcon from "../../../assets/dropdown.svg";
import {DepthPadding, EntryContainer, Icon, Text} from "./Entry.styles";

type EntryProps = {
	hasChildren?: boolean;
	icon: string;
	text: string;
	depth?: number;
	children?: JSX.Element[] | JSX.Element;
}

const Entry = ({hasChildren = false, depth = 0, icon, text, children}: EntryProps) => {
	const [areChildrenShow, setAreChildrenShow] = useState(false);


	return (
		<>
			<EntryContainer>
				{new Array(depth).fill(0).map((_: any, i: number) => <DepthPadding key={i}/>)}

				<Icon style={{transform: areChildrenShow ? "" : "rotate(-90deg)", opacity: hasChildren ? 1 : 0}}
					  src={dropDownIcon} onClick={() => setAreChildrenShow(!areChildrenShow)}/>

				<Icon src={icon}/>
				<Text>{text}</Text>
			</EntryContainer>
			{areChildrenShow && children}
		</>
	);
};

export default Entry;