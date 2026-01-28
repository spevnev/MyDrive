import React, {JSX, MouseEvent, useState} from "react";
import dropDownIcon from "assets/dropdown.svg";
import {DepthPadding, DropDownIcon, EntryContainer, Icon, Text} from "./Entry.styles";
import {useNavigate} from "react-router-dom";

type EntryProps = {
	hasChildren?: boolean;
	icon: string;
	text: string;
	depth?: number;
	children?: JSX.Element[] | JSX.Element;
	path: string;
}

const Entry = ({hasChildren = false, depth = 0, icon, text, children, path}: EntryProps) => {
	const navigate = useNavigate();
	const [areChildrenShow, setAreChildrenShow] = useState(false);


	const onDropDown = (e: MouseEvent) => {
		e.stopPropagation();
		setAreChildrenShow(!areChildrenShow);
	};


	const modifiedChildren = React.Children.map(children, child => {
		if (React.isValidElement(child)) {
			const props = child.props as any;
			if (!props || !props.path) return child;
			const updatedPath = `${path}/${props.path}`;
			const updatedDepth = depth + 1;
			// @ts-ignore
			return React.cloneElement(child, {path: updatedPath, depth: updatedDepth});
		}
		return child;

	});

	return (
		<>
			<EntryContainer onClick={() => path && navigate(`${document.location.pathname}#${path}`)}>
				{new Array(depth).fill(0).map((_: any, i: number) => <DepthPadding key={i}/>)}

				<DropDownIcon style={{transform: areChildrenShow ? "" : "rotate(-90deg)", opacity: hasChildren ? 1 : 0}} src={dropDownIcon} onClick={onDropDown}/>

				<Icon src={icon}/>
				<Text>{text}</Text>
			</EntryContainer>
			{areChildrenShow && modifiedChildren}
		</>
	);
};

export default Entry;