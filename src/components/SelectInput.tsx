import React from "react";

type SelectInputProps = {
	options: { value: any, text: string }[];
	onSelect: (value: any) => void;
}

const SelectInput = ({options, onSelect}: SelectInputProps) => {
	const onChange = (e: Event) => {

	};


	return (
		<select onChange={e => console.log({...e.target})}>
			{options.map(({text, value}) => <option key={value} value={value}>{text}</option>)}
		</select>
	);
};

export default SelectInput;