import React, {useRef, useState} from "react";
import {Button, Buttons, Container, Header, PrimaryButton} from "./Modal.styles";
import ModalWindow from "components/ModalWindow";
import SelectInput from "components/SelectInput";
import {Cross, ErrorMessage, Input, SubContainer, UserContainer, Username, Users, UserSubContainer} from "./ShareEntriesModal.styles";
import {Entry} from "../index";
import {useLazyQuery, useMutation} from "@apollo/client";
import {DOES_USER_EXIST_QUERY, GET_USER_IDS_QUERY, SHARE_ENTRIES_MUTATION} from "./ShareEntriesModal.queries";
import {getData} from "../../../services/token";

export type User = {
	username: string;
	canEdit: boolean;
}

export type ShareEntriesModalData = null | {
	entries: Entry[];
	users: User[];
};

type ShareEntriesModalProps = {
	modalData: ShareEntriesModalData | null
	setModalData: (arg: ShareEntriesModalData | null) => void;
}

const ShareEntriesModal = ({setModalData, modalData}: ShareEntriesModalProps) => {
	const [getUserIdsQuery] = useLazyQuery(GET_USER_IDS_QUERY);
	const [doesUserExistQuery] = useLazyQuery(DOES_USER_EXIST_QUERY);
	const [shareEntriesMutation] = useMutation(SHARE_ENTRIES_MUTATION);

	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const inputRef = useRef(null);


	if (modalData === null) return null;

	const share = async () => {
		const {data} = await getUserIdsQuery({variables: {usernames: modalData.users.map(user => user.username)}});
		const usernameToId = new Map<string, number>();
		(data.users as { username: string, id: number }[]).forEach(({username, id}) => usernameToId.set(username, id));

		const can_edit_users: number[] = [];
		const can_read_users: number[] = [];
		modalData.users.forEach(({username, canEdit}) => {
			const id = usernameToId.get(username);
			if (!id) return;

			can_read_users.push(id);
			if (canEdit) can_edit_users.push(id);
		});

		modalData.entries.forEach(({id}) => {
			shareEntriesMutation({variables: {file_id: id, policies: {can_read_users, can_edit_users}}});
		});
		setModalData(null);
	};

	const onRoleChange = (username: string, value: string) => {
		const canEdit = value === "true";
		setModalData({entries: modalData.entries, users: modalData.users.map(user => user.username === username ? {username, canEdit} : user)});
	};

	const showError = (msg: string) => {
		setErrorMessage(msg);
		setTimeout(() => setErrorMessage(null), 3000);
	};

	const addUser = async () => {
		const input = inputRef.current as any as HTMLInputElement;
		if (!input) return;
		const username = input.value;
		if (!username) return;

		const currentUsername = getData()?.username;
		if (username === currentUsername) return;
		if (modalData.users.filter(user => user.username === username).length === 1) return;

		const {data} = await doesUserExistQuery({variables: {username}});
		if (!data.doesUserExist) {
			showError("This user doesn't exist!");
			return;
		}

		input.value = "";
		setModalData({entries: modalData.entries, users: [...modalData.users, {username, canEdit: false}]});
	};

	const deleteUser = (username: string) => {
		setModalData({entries: modalData.entries, users: modalData.users.filter(user => user.username !== username)});
	};


	const options = [{text: "Editor", value: true}, {text: "Reader", value: false}];

	return (
		<ModalWindow>
			<Container style={{minHeight: 0}}>
				<Header>Share "{modalData.entries.map(({name}) => name).join(", ")}":</Header>

				<Users>
					{modalData.users.map(user =>
						<UserContainer key={user.username}>
							<Username>{user.username}</Username>

							<UserSubContainer>
								<SelectInput options={user.canEdit ? options : [...options].reverse()} onSelect={value => onRoleChange(user.username, value)}/>
								<Cross onClick={() => deleteUser(user.username)}/>
							</UserSubContainer>
						</UserContainer>,
					)}
				</Users>

				<SubContainer>
					<Input ref={inputRef}/>
					<Button onClick={addUser}>Add user</Button>
				</SubContainer>

				{errorMessage !== null && <ErrorMessage>{errorMessage}</ErrorMessage>}

				<Buttons>
					<Button onClick={() => setModalData(null)}>Cancel</Button>
					<PrimaryButton onClick={share}>OK</PrimaryButton>
				</Buttons>
			</Container>
		</ModalWindow>
	);
};

export default ShareEntriesModal;