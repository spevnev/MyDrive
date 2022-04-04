import React, {MouseEvent, useEffect} from "react";
import {Container, Name, Row} from "./Category.styles";

type DataElement = {
	key: string;
	[key: string]: any;
}

type CategoryProps = {
	name: string;
	Element: (...args: any) => JSX.Element;
	data: DataElement[];
	selected: boolean[];
	setSelected: (arg: boolean[]) => void;
}

let lastIdx = -1;
const Category = ({Element, name, data, selected, setSelected}: CategoryProps) => {
	useEffect(() => {
		if (selected.length === 0) setSelected(new Array(data.length).fill(false));
	}, [selected]);


	const changeSelection = (e: MouseEvent, idx: number) => {
		e.stopPropagation();

		if ((lastIdx === idx && e.shiftKey) || e.ctrlKey || e.metaKey) {
			const newSelected = [...selected];
			newSelected[idx] = !newSelected[idx];
			setSelected(newSelected);
		} else if (e.shiftKey && lastIdx !== -1) {
			setSelected(lastIdx < idx ?
				selected.map((cur, curIdx) => (curIdx >= lastIdx && curIdx <= idx) ? true : cur) :
				selected.map((cur, curIdx) => (curIdx >= idx && curIdx <= lastIdx) ? true : cur),
			);
		} else {
			const newSelected = new Array(data.length).fill(false);
			newSelected[idx] = true;
			setSelected(newSelected);
		}

		lastIdx = idx;
	};


	return (
		<Container>
			<Name>{name}</Name>

			<Row>
				{data.map((dataEl: DataElement, idx: number) =>
					<Element {...dataEl} isSelected={selected[idx]} onClick={(e: MouseEvent) => changeSelection(e, idx)}/>,
				)}
			</Row>
		</Container>
	);
};

export default Category;