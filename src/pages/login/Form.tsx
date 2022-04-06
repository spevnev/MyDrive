import React, {useEffect, useState} from "react";
import {Button, Column, Container, ErrorMessage, FormInputs, Input, SubTitle, Title} from "./Form.styles";

export type FormInput = {
	name: string;
	maxLength: number | null;
	errorMessage: string | null;
	placeholder: string | null;
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

const Form = ({initialFormData, submitForm, inputs, title, buttonText, background, color, subTitle}: FormProps) => {
	const [formData, setFormData] = useState<any>(initialFormData);
	const [shownError, setShownError] = useState(0);
	const [timeout, setTimeoutId] = useState<NodeJS.Timeout | null>();

	useEffect(() => () => {
		if (timeout) clearTimeout(timeout);
	});

	const showError = (errorNumber: number) => {
		setShownError(errorNumber);

		if (timeout) clearTimeout(timeout);
		setTimeoutId(setTimeout(() => {
			setShownError(0);
		}, 3000));
	};

	const onChange = (name: string, value: string) => {
		const newFormData: any = {...formData};
		if (newFormData[name] !== null) newFormData[name] = value;

		setFormData(newFormData);
	};


	return (
		<Container background={background} color={color}>
			<Column>
				<Title>{title}</Title>
				{subTitle && <SubTitle>{subTitle}</SubTitle>}
			</Column>

			<FormInputs>
				{inputs.map(({name, maxLength, errorMessage, placeholder}, i) =>
					<React.Fragment key={name}>
						<Input value={formData[name]} onChange={e => onChange(name, e.target.value)}
							   placeholder={placeholder || ""} maxLength={maxLength || -1}
							   style={shownError === i + 1 ? {border: "1px solid #d44"} : {}}/>

						{errorMessage && shownError === i + 1 && <ErrorMessage>{errorMessage}</ErrorMessage>}
					</React.Fragment>,
				)}

				<Button onClick={() => submitForm(formData, showError)}>{buttonText}</Button>
			</FormInputs>
		</Container>
	);
};

export default Form;