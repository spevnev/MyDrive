import React, {useEffect, useState} from "react";
import ModalWindow from "components/ModalWindow";
import {FolderArrayElement} from "services/file/fileTypes";
import StyledInput from "components/StyledInput";
import {useMutation} from "@apollo/client";
import {CREATE_FOLDER_MUTATION} from "./CreateFolderModal.queries";
import AutoCompleteInput from "components/AutoCompleteInput";
import {foldersArrayToPaths} from "services/file/fileResponse";
import {Trie} from "dataStructures/trie";
import {getFolderByPath, getFolderPath} from "services/file/fileRequest";
import {getData} from "services/token";
import {Entry} from "../index";
import {Button, Buttons, Container, DisabledButton, Header, PrimaryButton} from "./Modal.styles";

type CreateFolderModalProps = {
	isOpen: boolean;
	setIsOpen: (arg: boolean) => void;
	folders: FolderArrayElement[];
	addFoldersToCache: (...arg: FolderArrayElement[]) => void;
	addEntriesToCache: (...arg: Entry[]) => void;
	currentFolderId: number;
}

const trie = new Trie();
const CreateFolderModal = ({isOpen = false, setIsOpen, folders, addFoldersToCache, addEntriesToCache, currentFolderId}: CreateFolderModalProps) => {
	const initModalData = () => {
		const path = getFolderPath(folders, currentFolderId) || "/";
		return {path, name: "New Folder"};
	};

	const [modalData, setModalData] = useState<{ path: string, name: string } | null>(null);
	const [createFolderMutation] = useMutation(CREATE_FOLDER_MUTATION);

	useEffect(() => {
		trie.reset();
		foldersArrayToPaths(folders).forEach(path => trie.add(path));
	}, [folders]);

	useEffect(() => {
		if (isOpen) setModalData(initModalData());
	}, [isOpen]);

	const onSubmit = async () => {
		if (!modalData) return;

		setIsOpen(false);
		setModalData(initModalData());

		const result = await createFolderMutation({variables: {name: modalData.name, parent_id}});
		const data = result.data;
		if (!data || !data.createFolder) return;

		const tokenData = getData() || {};
		const id = data.createFolder;

		addFoldersToCache({name: modalData.name, parent_id: parent_id || tokenData.drive_id, id});
		addEntriesToCache({name: modalData.name, parent_id: parent_id || tokenData.drive_id, id, is_directory: true});
	};


	if (!modalData) return null;

	const tokenData = getData() || {};
	const parent_id = getFolderByPath(folders, modalData.path) || tokenData.drive_id;
	const folderNames = folders.filter(folder => folder.parent_id === parent_id).map(folder => folder.name);

	return (
		<ModalWindow isOpen={isOpen}>
			<Container>
				<Header>Folder creation</Header>

				<StyledInput placeholder="Folder name" value={modalData.name} onChange={e => setModalData({...modalData, name: e.target.value})}/>
				<AutoCompleteInput placeholder="Path" initialValue={modalData.path} trie={trie} onChange={value => setModalData({...modalData, path: value || ""})}/>

				<Buttons>
					<Button onClick={() => setIsOpen(false)}>Cancel</Button>
					{folderNames.includes(modalData.name)
						? <DisabledButton>This name is already taken!</DisabledButton>
						: <PrimaryButton onClick={onSubmit}>OK</PrimaryButton>}
				</Buttons>
			</Container>
		</ModalWindow>
	);
};

export default CreateFolderModal;