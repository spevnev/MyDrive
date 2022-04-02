import React, {useEffect, useState} from "react";
import {Button, Container, ErrorMessage, FormInputs, FormTitle, Input} from "./Form.styles";

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
}

const Form = ({initialFormData, submitForm, inputs, background, color}: FormProps) => {
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
			<FormTitle>Signup</FormTitle>

			<FormInputs>
				{inputs.map(({name, maxLength, errorMessage, placeholder}, i) =>
					<React.Fragment key={name}>
						<Input value={formData[name]} onChange={e => onChange(name, e.target.value)}
							   placeholder={placeholder || ""} maxLength={maxLength || -1}
							   style={shownError === i + 1 ? {border: "1px solid #d44"} : {}}/>

						{errorMessage && shownError === i + 1 && <ErrorMessage>{errorMessage}</ErrorMessage>}
					</React.Fragment>,
				)}

				<Button onClick={() => submitForm(formData, showError)}>Sign up</Button>
			</FormInputs>
		</Container>
	);
};

export default Form;