import React, {MouseEvent} from "react";
import {createPortal} from "react-dom";
import {BR, Container, Icon, Name, Option} from "./ContextMenu.styles";
import contextMenuOptionsFactory, {EContextMenuOptions} from "../service/contextMenuOptionFactory";

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
	options?: ContextMenuOption[];
}

const areCoordinatesValid = (x: number, y: number): boolean => !(x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight);

const calculateAbsolutePosition = (x: number, y: number, [optionsNum, BRNum]: number[]): { width: number, height: number, top: number, left: number } => {
	const cx = window.innerWidth / 2;
	const cy = window.innerHeight / 2;

	const width = 200;
	const optionWidth = 35;
	const height = optionsNum * optionWidth + BRNum * (optionWidth / 2);

	const top = cy < y ? y - height : y;
	const left = cx < x ? x - width : x;

	return {width, height, top, left};
};

const ContextMenu = ({isOpened = false, options = [], x = 0, y = 0}: ContextMenuProps) => {
	if (!options || !isOpened || !areCoordinatesValid(x, y)) return null;

	const element: Element | null = document.getElementById("contextMenu");
	if (!element) return null;


	const optionsNum = options.reduce((prev, cur) => {
		const temp = prev;
		temp[cur.name === "BR" ? 1 : 0]++;
		return temp;
	}, [0, 0]);

	return createPortal(
		<Container style={calculateAbsolutePosition(x, y, optionsNum)}>
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