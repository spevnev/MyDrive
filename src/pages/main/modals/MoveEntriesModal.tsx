import React, {useContext, useEffect} from "react";
import AutoCompleteInput from "components/AutoCompleteInput";
import ModalWindow from "components/ModalWindow";
import {Trie} from "dataStructures/trie";
import {Button, Buttons, Container, DisabledButton, Header, PrimaryButton} from "./Modal.styles";
import {CacheContext, CurrentDataContext, Entry} from "../index";
import {foldersArrayToPaths, getFolderByPath, renameToAvoidNamingCollisions} from "../../../services/file/file";
import {useLazyQuery, useMutation} from "@apollo/client";
import {MOVE_ENTRIES_MUTATION} from "./MoveEntriesModal.queries";
import {GET_ENTRIES_QUERY} from "../FileInputs.queries";
import {getData} from "../../../services/token";
import {FileEntry, FolderArrayElement} from "../../../services/file/fileTypes";
import {client} from "../../../index";
import {CURRENT_FOLDER_QUERY} from "../index.queries";

export type MoveEntriesModalData = {
	entries: Entry[] | null;
	input: string | null;
} | null

type UploadEntriesModalProps = {
	modalData: MoveEntriesModalData;
	setModalData: (arg: MoveEntriesModalData) => void;
}

const trie = new Trie();
const MoveEntriesModal = ({modalData, setModalData}: UploadEntriesModalProps) => {
	const path = decodeURI(window.location.hash.slice(1)).replace(/^\/?Drive/, "");

	const {folders, sharedFolders, currentEntries} = useContext(CurrentDataContext);
	const {writeFoldersToCache, writeEntriesToCache} = useContext(CacheContext);

	const [moveEntriesMutation] = useMutation(MOVE_ENTRIES_MUTATION);
	const [getEntriesQuery] = useLazyQuery(GET_ENTRIES_QUERY);

	useEffect(() => {
		if (!modalData) return;

		trie.reset();
		foldersArrayToPaths(folders).forEach(path => trie.add(`Drive/${path}`));
		foldersArrayToPaths(sharedFolders).forEach(path => trie.add(`Shared/${path}`)); // TODO. Filter out folders user doesn't have 'editor' access to
	}, [modalData, folders, sharedFolders]);


	const updateCache = (movedEntries: Entry[], parent_id: number) => {
		const idToEntry = new Map<number, Entry>(movedEntries.reduce((arr: [number, Entry][], cur) => [...arr, [cur.id, {...cur, parent_id}]], []));
		const movedIds = movedEntries.map(entry => entry.id);
		const remainingEntries = currentEntries.filter(entry => !movedIds.includes(entry.id));

		writeFoldersToCache(folders.map(folder => idToEntry.get(folder.id) || folder) as FolderArrayElement[], [...sharedFolders], false);
		writeEntriesToCache(remainingEntries, false);

		const query = client.readQuery({query: CURRENT_FOLDER_QUERY, variables: {parent_id}});
		if (!query) return;

		writeEntriesToCache([...query.entries, ...movedEntries], false, parent_id);
	};

	const onClick = async () => {
		if (!modalData || !modalData.entries) return;

		const drive_id = getData()?.drive_id;
		const parent_id = getFolderByPath(folders, modalData.input || "/") || drive_id;
		if (!parent_id) return;

		const parentEntries = (await getEntriesQuery({variables: {parent_id}})).data.entries;
		const fileEntries = modalData.entries.map(entry => ({...entry, path: null, size: 0})) as FileEntry[];
		// @ts-ignore
		const entries = renameToAvoidNamingCollisions(fileEntries, parentEntries).map(entry => ({id: entry.id, parent_id: entry.parent_id, name: entry.newName || entry.name}));

		const {data} = await moveEntriesMutation({variables: {entries, parent_id}});
		setModalData(null);
		if (!data.moveEntries) return;

		updateCache(entries as Entry[], parent_id);
	};


	if (!modalData || modalData.entries?.length === 0) return null;

	const canBeMovedTo = ((modalData.input === "" || modalData.input === "/") || getFolderByPath(folders, modalData.input || "") !== null) && modalData.input !== path;

	return (
		<ModalWindow>
			<Container>
				<Header>Moving {modalData.entries?.length || 0} files</Header>

				<AutoCompleteInput placeholder="Path" initialValue={modalData.input || ""} trie={trie} onChange={value => setModalData({...modalData, input: value})}/>

				<Buttons>
					<Button onClick={() => setModalData(null)}>Cancel</Button>
					{canBeMovedTo
						? <PrimaryButton onClick={onClick}>OK</PrimaryButton>
						: <DisabledButton>Invalid folder!</DisabledButton>
					}
				</Buttons>
			</Container>
		</ModalWindow>
	);
};

export default MoveEntriesModal;