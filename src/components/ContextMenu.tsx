import React, {MouseEvent} from "react";
import {createPortal} from "react-dom";
import {BR, Container, Icon, Name, Option} from "./ContextMenu.styles";

export type ContextMenuOption = {
	name: string;
	icon: string;
	callback: Function;
};

export type ContextMenuProps = {
	isOpened?: boolean;
	setIsOpened?: (isOpened: boolean) => void;
	x?: number;
	y?: number;
	width?: number;
	options?: ContextMenuOption[];
	onClick?: (e: MouseEvent) => void;
}

const ContextMenu = ({isOpened = false, options = [], x = 0, y = 0, width = 200, onClick = () => {}}: ContextMenuProps) => {
	const areCoordinatesValid = (): boolean => !(x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight);

	if (!options || !isOpened || !areCoordinatesValid()) return null;

	const element: Element | null = document.getElementById("contextMenu");
	if (!element) return null;


	const countOptions = () => {
		return options.reduce((prev, cur) => {
			const temp = prev;
			temp[cur.name === "BR" ? 1 : 0]++;
			return temp;
		}, [0, 0]);
	};

	const calculateAbsolutePosition = (): { width: number, height: number, top: number, left: number } => {
		const [optionNum, BRNum] = countOptions();

		const cx = window.innerWidth / 2;
		const cy = window.innerHeight / 2;

		const optionHeight = 35;
		const height = optionNum * optionHeight + BRNum * (optionHeight / 2);

		const top = cy < y ? y - height : y;
		const left = cx < x ? x - width : x;

		return {width, height, top, left};
	};


	return createPortal(
		<Container style={calculateAbsolutePosition()} onClick={onClick}>
			{options.map(({name, icon, callback}: ContextMenuOption, i) =>
				name === "BR" ?
					<BR key={i}/>
					:
					<Option key={icon} onClick={() => callback()}>
						<Icon src={icon}/>
						<Name>{name}</Name>
					</Option>,
			)}
		</Container>,
		element,
	);
};

export default ContextMenu;