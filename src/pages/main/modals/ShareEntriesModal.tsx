import React from "react";
import ModalWindow from "../../../components/ModalWindow";
import {Button, Buttons, Container, Header, PrimaryButton} from "./Modal.styles";
import styled from "styled-components";
import SelectInput from "../../../components/SelectInput";
import cross from "assets/cross.svg";

const Users = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserContainer = styled.div`

`;

const Username = styled.div`

`;

const DeleteImage = styled.img`

`;

const SubContainer = styled.div`

`;
// TODO: move to styles file????


type User = {
	username: string;
	canEdit: boolean;
}

type ModalData = {
	entries: number[];
	users: User[];
};

type ShareEntriesModalProps = {
	modalData: ModalData | null
	setModalData: (arg: ModalData | null) => void;
}

const ShareEntriesModal = ({setModalData, modalData}: ShareEntriesModalProps) => {
	const share = () => {

	};


	if (modalData === null) return null;
	return (
		<ModalWindow isOpen={true}>
			<Container>
				<Header>Sharing {modalData.entries.length} files</Header>

				<Users>
					{modalData.users.map(user =>
						<UserContainer key={user.username}>
							<Username>{user.username}</Username>

							<SubContainer>
								<DeleteImage src={cross} onClick={() => console.log()}/>
								<SelectInput options={[{text: "Editor", value: true}, {text: "Reader", value: false}]} onSelect={value => console.log(value)}/>
							</SubContainer>
						</UserContainer>,
					)}
				</Users>

				{/* TODO: Input + button */}

				<Buttons>
					<Button onClick={() => setModalData(null)}>Cancel</Button>
					<PrimaryButton onClick={share}>OK</PrimaryButton>
				</Buttons>
			</Container>
		</ModalWindow>
	);
};

export default ShareEntriesModal;