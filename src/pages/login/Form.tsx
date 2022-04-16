import React, {useRef, useState} from "react";
import {Button, Column, Container, ErrorMessage, FormInputs, Input, SubTitle, Title} from "./Form.styles";
import useKeyboard from "../../hooks/useKeyboard";

export type FormInput = {
	name: string;
	maxLength: number;
	errorMessage: string;
	placeholder: string;
	type?: string;
}

export type FormProps = {
	initialFormData: Object;
	submitForm: Function;
	inputs: FormInput[];
	background: string;
	color: string;
	title: string;
	buttonText: string;
	subTitle?: JSX.Element;
}

const SUBMIT_DELAY_MS = 500; // .5s

let lastSubmit: number = 0;
const Form = ({initialFormData, submitForm, inputs, title, buttonText, background, color, subTitle}: FormProps) => {
	const [formData, setFormData] = useState<any>(initialFormData);
	const [shownError, setShownError] = useState(0);
	const [errorText, setErrorText] = useState<null | string>(null);
	const containerRef = useRef(null);

	useKeyboard({
		key: "Enter", cb: e => {
			const path = (e as any).path;
			if (path.indexOf(containerRef.current) === -1) return;
			onSubmit();
		},
	});


	const showError = (errorNumber: number, text?: string) => {
		setShownError(errorNumber);
		if (text) setErrorText(text);
		else setErrorText(null);
	};

	const onChange = (name: string, value: string) => {
		const newFormData: any = {...formData};
		if (newFormData[name] !== null) newFormData[name] = value;

		setFormData(newFormData);
	};

	const onSubmit = () => {
		if (lastSubmit + SUBMIT_DELAY_MS > Date.now()) return;

		lastSubmit = Date.now();
		setShownError(0);
		submitForm(formData, showError);
	};


	return (
		<Container background={background} color={color} ref={containerRef}>
			<Column>
				<Title>{title}</Title>
				{subTitle && <SubTitle>{subTitle}</SubTitle>}
			</Column>

			<FormInputs>
				{inputs.map(({name, maxLength, errorMessage, placeholder, type}, i) =>
					<React.Fragment key={name}>
						<Input value={formData[name]} onChange={e => onChange(name, e.target.value)} type={type || "text"}
							   placeholder={placeholder || ""} maxLength={maxLength || -1}
							   style={shownError === i + 1 ? {border: "1px solid #d44"} : {}}/>

						{errorMessage && shownError === i + 1 && <ErrorMessage>{errorText || errorMessage}</ErrorMessage>}
					</React.Fragment>,
				)}

				<Button onClick={onSubmit}>{buttonText}</Button>
			</FormInputs>
		</Container>
	);
};

export default Form;