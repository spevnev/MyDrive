import React, {ChangeEvent, useEffect, useState} from "react";
import {Trie} from "dataStructures/trie";
import styled from "styled-components";
import useKeyboard from "hooks/useKeyboard";

const Container = styled.div`
  position: relative;
`;

const Input = styled.input`
  font-size: 18px;
  font-weight: 300;
  padding: 6px 8px;
  background: #fbfbfb;
  border: 1px solid #aaa;
  outline: none;
  width: 100%;
  border-radius: 4px;

  &.has-options {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  top: 100%;
  width: 100%;
  z-index: 999;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
  border: 1px solid #aaa;
`;

const Option = styled.div`
  height: 30px;
  padding: 6px 8px;
  font-size: 18px;
  text-align: center;
  background: #fdfdfd;
  margin-top: -1px;
  cursor: pointer;
  transition: all .2s;

  &:hover {
    background: #f2f2f2;
  }

  &.selected {
    background: #e8e8e8
  }
`;

type InputProps = {
	trie: Trie;
	placeholder: string;
	onChange: (arg: string | null) => void;
	initialValue: any;
}

const AutoCompleteInput = ({trie, placeholder, onChange, initialValue = ""}: InputProps) => {
	const [showOptions, setShowOptions] = useState(false);
	const [options, setOptions] = useState<string[]>([]);
	const [value, setValue] = useState(initialValue);
	const [selected, setSelected] = useState(-1);

	useKeyboard({
		key: "ArrowDown", cb: e => {
			if (selected < options.length - 1) setSelected(selected + 1);
		},
	});
	useKeyboard({
		key: "ArrowUp", cb: e => {
			if (selected > -1) setSelected(selected - 1);
		},
	});
	useKeyboard({
		key: "Enter", cb: e => {
			if (selected > -1 && selected < options.length) setChanges(options[selected]);
		},
	});
	useKeyboard({
		key: "Escape", cb: e => {
			if (showOptions) setShowOptions(false);
		},
	});

	useEffect(() => {
		if (selected >= options.length) setSelected(options.length - 1);
	}, [options]);


	const isValid = (value: string): boolean => trie.length === 0 || trie.has(value) || trie.has(`/${value}`) || trie.has(`${value}/`);

	const onInput = (e: ChangeEvent) => {
		const value = (e.target as HTMLInputElement).value;

		if (!showOptions) setShowOptions(true);
		setChanges(value);
	};

	const setChanges = (value: string) => {
		setValue(value);
		setOptions(trie.get(value, 5, true));
		onChange(value);
	};


	return (
		<Container>
			<Input style={{borderColor: isValid(value) ? "#35e525" : "#e52525"}} onFocus={() => setShowOptions(true)} onBlur={() => setTimeout(() => setShowOptions(false), 200)}
				   placeholder={placeholder} value={value} onChange={onInput} className={options.length === 0 ? "" : "has-options"}/>

			{(options.length > 0 && showOptions) &&
				<Options>
					{options.map((string, i) =>
						<Option key={string} className={selected === i ? "selected" : ""} onClick={() => setChanges(options[i])}>{string}</Option>,
					)}
				</Options>
			}
		</Container>
	);
};

export default AutoCompleteInput;