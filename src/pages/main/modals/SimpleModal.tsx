import React from "react";
import {Button, Buttons, Container, Header, PrimaryButton} from "./Modal.styles";
import {Info} from "./SimpleModal.styles";
import ModalWindow from "../../../components/ModalWindow";

export type SimpleModalData = {
	title: string;
	info?: string;
	buttons?: string[];
	onAction: (arg: boolean, id?: number) => void;
}

type SimpleModalProps = {
	modalData: SimpleModalData | null;
}

const SimpleModal = ({modalData}: SimpleModalProps) => {
	if (!modalData) return null;

	const {title, info, onAction, buttons} = modalData;
	return (
		<ModalWindow>
			<Container height={100}>
				<Header>{title}</Header>

				{info && <Info>{info}</Info>}

				<Buttons>
					<Button onClick={() => onAction(false)}>Cancel</Button>
					{buttons ?
						<>
							{buttons.map((str, i) => <PrimaryButton key={str} onClick={() => onAction(true, i)}>{str}</PrimaryButton>)}
						</>
						: <PrimaryButton onClick={() => onAction(true)}>Confirm</PrimaryButton>
					}
				</Buttons>
			</Container>
		</ModalWindow>
	);
};

export default SimpleModal;