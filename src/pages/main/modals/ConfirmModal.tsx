import React from "react";
import {Button, Buttons, Container, Header, PrimaryButton} from "./Modal.styles";
import {Info} from "./ConfirmModal.styles";
import ModalWindow from "../../../components/ModalWindow";

export type ConfirmModalData = {
	title: string;
	info: string | undefined;
	onAction: (arg: boolean) => void;
}

type ConfirmModalProps = {
	modalData: ConfirmModalData | null;
}

const ConfirmModal = ({modalData}: ConfirmModalProps) => {
	if (!modalData) return null;

	const {title, info, onAction} = modalData;
	return (
		<ModalWindow>
			<Container height={100}>
				<Header>{title}</Header>

				{info && <Info>{info}</Info>}

				<Buttons>
					<Button onClick={() => onAction(false)}>Cancel</Button>
					<PrimaryButton onClick={() => onAction(true)}>Confirm</PrimaryButton>
				</Buttons>
			</Container>
		</ModalWindow>
	);
};

export default ConfirmModal;