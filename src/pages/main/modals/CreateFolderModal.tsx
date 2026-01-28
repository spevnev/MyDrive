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
import {GET_ENTRY_SHARE_ID_QUERY} from "../index.queries";
import useKeyboard from "../../../hooks/useKeyboard";

type CreateFolderModalProps = {
	isOpen: boolean;
	setIsOpen: (arg: boolean) => void;
}

const trie = new Trie();
const CreateFolderModal = ({isOpen = false, setIsOpen}: CreateFolderModalProps) => {
	const {currentFolderId, folders, sharedFolders} = useContext(CurrentDataContext);
	const {writeFoldersToCache, writeEntriesToCache} = useContext(CacheContext);

	const editableSharedFolders = sharedFolders.filter(folder => folder.can_edit);

	const initModalData = () => {
		const drivePath = getFolderPath(folders, currentFolderId);
		const sharedPath = getFolderPath(editableSharedFolders, currentFolderId);
		const name = sharedPath ? editableSharedFolders.filter(folder => folder.id === currentFolderId)[0].username : "";

		const path = drivePath ? `Drive${drivePath}` : sharedPath ? `Shared/${name}${sharedPath}` : "Drive";
		return {path, name: "New Folder"};
	};

	const [modalData, setModalData] = useState<{ path: string, name: string } | null>(null);

	const [createFolderMutation] = useMutation(CREATE_FOLDER_MUTATION);
	const [getEntryShareIdQuery] = useLazyQuery(GET_ENTRY_SHARE_ID_QUERY);

	useKeyboard({key: "Escape", cb: () => onCancel()});
	useKeyboard({key: "Enter", cb: () => onSubmit()});

	useEffect(() => {
		trie.reset();
		trie.add("Drive");
		foldersArrayToPaths(folders).forEach(path => trie.add(`Drive${path}`));
		foldersArrayToPaths(editableSharedFolders, true).forEach(path => trie.add(`Shared${path}`));
	}, [folders, sharedFolders]);

	useEffect(() => {
		if (isOpen) setModalData(initModalData());
	}, [isOpen]);


	const onCancel = () => {
		setIsOpen(false);
		setModalData(null);
	};

	const onSubmit = async () => {
		if (!modalData || !canSubmit) return;

		setIsOpen(false);
		setModalData(initModalData());

		const result = await createFolderMutation({variables: {name: modalData.name, parent_id}});
		const data = result.data;
		if (!data || !data.createFolder) return;
		const id = data.createFolder;

		const {data: {entry}} = await getEntryShareIdQuery({variables: {id: parent_id}});
		const share_id = entry ? entry.share_id : null;

		writeFoldersToCache([{name: modalData.name, parent_id, id, share_id, bin_data: null, can_edit: true}]);
		if (parent_id !== currentFolderId) return;
		writeEntriesToCache([{name: modalData.name, parent_id, id, is_directory: true, can_edit: true, preview: null, bin_data: null}]);
	};

	const getCurrentParentId = (): number => {
		if (!modalData) return -1;
		const drive_id = getData()?.drive_id;

		if (modalData.path.startsWith("Drive")) return getFolderByPath(folders, modalData.path.slice(5)) || drive_id;
		return getFolderByPath(editableSharedFolders, modalData.path.split("/").slice(2).join("/")) || -1;
	};


	if (!modalData || !isOpen) return null;

	const parent_id = getCurrentParentId();
	const folderNames = [...folders, ...sharedFolders].filter(folder => folder.parent_id === parent_id).map(folder => folder.name);
	const canSubmit = modalData && modalData.name !== "" && !folderNames.includes(modalData.name);

	return (
		<ModalWindow>
			<Container>
				<Header>Folder creation</Header>

				<StyledInput placeholder="Folder name" value={modalData.name} onChange={e => setModalData({...modalData, name: e.target.value})}/>
				<AutoCompleteInput placeholder="Path" initialValue={modalData.path} trie={trie} onChange={value => setModalData({...modalData, path: value || ""})}/>

				<Buttons>
					<Button onClick={onCancel}>Cancel</Button>
					{canSubmit
						? <PrimaryButton onClick={onSubmit}>OK</PrimaryButton>
						: <DisabledButton>This name is already taken!</DisabledButton>
					}
				</Buttons>
			</Container>
		</ModalWindow>
	);
};

export default CreateFolderModal;
