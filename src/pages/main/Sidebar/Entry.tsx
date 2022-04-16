import React, {MouseEvent, useState} from "react";
import dropDownIcon from "assets/dropdown.svg";
import {DepthPadding, DropDownIcon, EntryContainer, Icon, Text} from "./Entry.styles";

type EntryProps = {
	hasChildren?: boolean;
	icon: string;
	text: string;
	depth?: number;
	children?: JSX.Element[] | JSX.Element;
	onClick?: (e: MouseEvent) => void;
}

const Entry = ({hasChildren = false, depth = 0, icon, text, children, onClick = () => {}}: EntryProps) => {
	const [areChildrenShow, setAreChildrenShow] = useState(false);


	const onDropDown = (e: MouseEvent) => {
		e.stopPropagation();
		setAreChildrenShow(!areChildrenShow);
	};


	return (
		<>
			<EntryContainer onClick={onClick}>
				{new Array(depth).fill(0).map((_: any, i: number) => <DepthPadding key={i}/>)}

				<DropDownIcon style={{transform: areChildrenShow ? "" : "rotate(-90deg)", opacity: hasChildren ? 1 : 0}} src={dropDownIcon} onClick={onDropDown}/>

				<Icon src={icon}/>
				<Text>{text}</Text>
			</EntryContainer>
			{areChildrenShow && children}
		</>
	);
};

export default Entry;