import React from "react";
import styled from "styled-components";

const Select = styled.select`
  outline: none;
  font-size: 16px;
  font-weight: 300;
  padding: 2px 4px;
`;

type SelectInputProps = {
	options: { value: any, text: string }[];
	onSelect: (value: any) => void;
}

const SelectInput = ({options, onSelect}: SelectInputProps) => (
	<Select onChange={e => onSelect(e.target.value)}>
		{options.map(({text, value}) => <option key={value} value={value}>{text}</option>)}
	</Select>
);

export default SelectInput;