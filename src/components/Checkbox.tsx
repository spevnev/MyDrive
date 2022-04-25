import React, {useEffect, useState} from "react";
import styled from "styled-components";

const Container = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;

  &:hover p::after {
    background: #dbdbdb;
  }
`;

const HiddenCheckbox = styled.input`
  display: none;
`;

const Text = styled.p`
  font-size: 16px;
  font-weight: 300;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  margin: 5px 0;
  position: relative;

  &::after {
    content: '';
    transition: all .2s;
    display: block;
    width: 14px;
    height: 14px;
    background: #f9f9f9;
    border: 1px solid #aaa;
    border-radius: 3px;
    margin-right: 8px;
  }

  &::before {
    content: '';
    position: absolute;
    left: 5.5px;
    top: 2px;
    display: none;
    width: 3px;
    height: 7px;
    border-right: 2.5px solid #fff;
    border-bottom: 2.5px solid #fff;
    transform: translate(0, 25%) rotate(45deg);
  }

  input:checked + & {
    &::before {
      display: block;
    }

    &::after {
      background: #5555fe;
      border: 1px solid #555;
    }
  }
`;

type CheckboxProps = {
	children: string;
	defaultValue: boolean;
	onChange: (value: boolean) => void;
}

const ids = new Set<String>();
const Checkbox = ({children, onChange, defaultValue}: CheckboxProps) => {
	const [id, setId] = useState<any>();

	useEffect(() => {
		let id = String(Math.random());
		while (ids.has(id)) id = String(Math.random());
		ids.add(id);
		setId(id);

		return () => {
			ids.delete(id);
		};
	}, []);


	return (
		<Container htmlFor={id}>
			<HiddenCheckbox defaultChecked={defaultValue} id={id} type="checkbox" onInput={e => onChange((e.target as HTMLInputElement).checked)}/>
			<Text>{children}</Text>
		</Container>
	);
};

export default Checkbox;