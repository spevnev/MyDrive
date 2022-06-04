import React from "react";
import {Buttons, Container, Header, PrimaryButton} from "./Modal.styles";
import ModalWindow from "../../../components/ModalWindow";
import {List, ListElement} from "./InfoModal.styles";
import useKeyboard from "../../../hooks/useKeyboard";

export type InfoModalData = {
	title: string;
	list: { [key: string]: any };
}

type InfoModalProps = {
	modalData: InfoModalData | null;
	setModalData: (arg: null) => void;
}

const InfoModal = ({modalData, setModalData}: InfoModalProps) => {
	useKeyboard({key: "Escape", cb: () => setModalData(null)});
	useKeyboard({key: "Enter", cb: () => setModalData(null)});


	if (!modalData) return null;

	const {title, list} = modalData;
	return (
		<ModalWindow>
			<Container>
				<Header>{title}</Header>

				<List>
					{Object.entries(list).map(([key, value]) => <ListElement key={key}>{key}: {String(value)}</ListElement>)}
				</List>

				<Buttons>
					<PrimaryButton onClick={() => setModalData(null)}>OK</PrimaryButton>
				</Buttons>
			</Container>
		</ModalWindow>
	);
};

export default InfoModal;