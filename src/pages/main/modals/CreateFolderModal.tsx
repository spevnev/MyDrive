import React, {useContext, useEffect, useState} from "react";
import ModalWindow from "components/ModalWindow";
import StyledInput from "components/StyledInput";
import {useLazyQuery, useMutation} from "@apollo/client";
import {CREATE_FOLDER_MUTATION} from "./CreateFolderModal.queries";
import AutoCompleteInput from "components/AutoCompleteInput";
import {Trie} from "dataStructures/trie";
import {getData} from "services/token";
import {CacheContext, CurrentDataContext} from "../index";
import {Button, Buttons, Container, DisabledButton, Header, PrimaryButton} from "./Modal.styles";
import {foldersArrayToPaths, getFolderByPath, getFolderPath} from "../../../services/file/file";
import {GET_ENTRY_QUERY} from "../index.queries";

type CreateFolderModalProps = {
	isOpen: boolean;
	setIsOpen: (arg: boolean) => void;
}

const trie = new Trie();
const CreateFolderModal = ({isOpen = false, setIsOpen}: CreateFolderModalProps) => {
	const {currentFolderId, folders} = useContext(CurrentDataContext);
	const {cacheFolders, cacheCurrentEntries} = useContext(CacheContext);

	const initModalData = () => {
		const path = getFolderPath(folders, currentFolderId) || "/";
		return {path, name: "New Folder"};
	};

	const [modalData, setModalData] = useState<{ path: string, name: string } | null>(null);

	const [createFolderMutation] = useMutation(CREATE_FOLDER_MUTATION);
	const [getEntryQuery] = useLazyQuery(GET_ENTRY_QUERY);

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

		const drive_id = getData()?.drive_id;
		const id = data.createFolder;

		const curParentId = parent_id || drive_id;

		const {data: {entry}} = await getEntryQuery({variables: {id: curParentId}});
		const share_id = entry ? entry.share_id : null;

		cacheFolders({name: modalData.name, parent_id: curParentId, id, share_id});
		cacheCurrentEntries({name: modalData.name, parent_id: curParentId, id, is_directory: true, preview: null});
	};


	if (!modalData) return null;

	const drive_id = getData()?.drive_id;
	const parent_id = getFolderByPath(folders, modalData.path) || drive_id;
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