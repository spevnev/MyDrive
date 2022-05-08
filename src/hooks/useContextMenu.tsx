import React, {MouseEvent, useState} from "react";
import {BR, Container, Icon, Name, Option} from "./useContextMenu.styles";
import contextMenuOptionFactory, {EContextMenuTypes} from "../helpers/contextMenuOptionFactory";

export type ContextMenuOption = {
	name: string;
	icon: string;
	callback: Function;
};

export type ContextMenuProps = {
	x: number;
	y: number;
	options: ContextMenuOption[];
}

const useContextMenu = (): [Function, Function, JSX.Element | null] => {
	const [isOpen, setIsOpen] = useState(false);
	const [contextMenuProps, setContextMenuProps] = useState<ContextMenuProps>({options: [], x: 0, y: 0});
	const {options, x, y} = contextMenuProps;


	const areCoordinatesValid = (): boolean => !(x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight);

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

		const optionHeight = Math.max(window.innerHeight * 4.5 / 100, 40);
		const height = optionNum * optionHeight + BRNum * (optionHeight / 2);
		const width = Math.max(window.innerWidth * 15 / 100, 200);

		const top = cy < y ? y - height : y;
		const left = cx < x ? x - width : x;

		return {width, height, top, left};
	};

	const openContextMenu = (e: MouseEvent, contextMenuData: object, contextMenuType: EContextMenuTypes) => {
		const options: ContextMenuOption[] | null = contextMenuOptionFactory(contextMenuType, contextMenuData);
		if (!options) throw new Error("Invalid context menu.svg type!");

		e.preventDefault();
		e.stopPropagation();

		setContextMenuProps({x: e.pageX, y: e.pageY, options});
		setIsOpen(true);
	};


	if (!isOpen || !areCoordinatesValid()) return [openContextMenu, setIsOpen, null];

	return [
		openContextMenu as Function,
		setIsOpen as Function,
		<Container style={calculateAbsolutePosition()} onClick={() => setIsOpen(false)}>
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
	];
};

export default useContextMenu;