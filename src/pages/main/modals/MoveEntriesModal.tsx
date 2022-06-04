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
import useKeyboard from "../../../hooks/useKeyboard";

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
	const path = decodeURI(window.location.hash.slice(1));

	const {folders, sharedFolders, currentEntries} = useContext(CurrentDataContext);
	const {writeFoldersToCache, writeEntriesToCache} = useContext(CacheContext);

	const [moveEntriesMutation] = useMutation(MOVE_ENTRIES_MUTATION);
	const [getEntriesQuery] = useLazyQuery(GET_ENTRIES_QUERY);

	const editableSharedFolders = sharedFolders.filter(folder => folder.can_edit);

	useKeyboard({
		key: "Escape", cb: e => {
			if (e.defaultPrevented) return;
			setModalData(null);
		},
	});
	useKeyboard({
		key: "Enter", cb: e => {
			if (e.defaultPrevented) return;
			onSubmit();
		},
	});

	useEffect(() => {
		if (!modalData) return;

		trie.reset();
		trie.add("Drive");
		foldersArrayToPaths(folders).forEach(path => trie.add(`Drive${path}`));
		foldersArrayToPaths(editableSharedFolders, true).forEach(path => trie.add(`Shared${path}`));
	}, [modalData, folders, sharedFolders]);


	const getCurrentParentId = (): number => {
		if (!modalData || !modalData.input) return -1;
		const drive_id = getData()?.drive_id;

		if (modalData.input.startsWith("Drive")) return getFolderByPath(folders, modalData.input.slice(5)) || drive_id;
		return getFolderByPath(editableSharedFolders, modalData.input.split("/").slice(2).join("/")) || -1;
	};

	const onSubmit = async () => {
		if (!modalData || !modalData.entries || !canBeMovedTo) return;

		const parent_id = getCurrentParentId();
		const parentEntries = (await getEntriesQuery({variables: {parent_id}})).data.entries;
		const fileEntries = modalData.entries.map(entry => ({...entry, path: null, size: 0})) as FileEntry[];
		const entries = renameToAvoidNamingCollisions(fileEntries, parentEntries) as any as (Entry & { newName: string })[];
		const entriesToMove = entries.map(entry => ({id: entry.id, parent_id: entry.parent_id, name: entry.newName || entry.name}));

		const {data} = await moveEntriesMutation({variables: {entries: entriesToMove, parent_id}});
		setModalData(null);
		if (!data.moveEntries) return;

		const idToEntry = new Map<number, Entry>(entries.reduce((arr: [number, Entry][], cur) => [...arr, [cur.id, {...cur, parent_id}]], []));
		const movedIds = entries.map(entry => entry.id);
		const remainingEntries = currentEntries.filter(entry => !movedIds.includes(entry.id));

		writeFoldersToCache(folders.map(folder => idToEntry.get(folder.id) || folder) as FolderArrayElement[], [...sharedFolders], false);
		writeEntriesToCache(remainingEntries, false);
		writeEntriesToCache(entries.map(entry => ({...entry, preview: null, bin_data: null})), true, parent_id);
	};


	if (!modalData || !modalData.entries || modalData.entries?.length === 0) return null;

	const pathsOfMovedEntries = modalData.entries.map(folder => `${path}/${folder.name}`);
	const canBeMovedTo = modalData.input && modalData.input !== path && trie.has(modalData.input || "") && pathsOfMovedEntries.reduce((res, cur) => res ? !modalData.input?.startsWith(cur + "/") && modalData.input !== cur : false, true);

	return (
		<ModalWindow>
			<Container>
				<Header>Moving {modalData.entries.length || 0} files</Header>

				<AutoCompleteInput placeholder="Path" initialValue={modalData.input || ""} trie={trie} onChange={value => setModalData({...modalData, input: value})}/>

				<Buttons>
					<Button onClick={() => setModalData(null)}>Cancel</Button>
					{canBeMovedTo
						? <PrimaryButton onClick={onSubmit}>OK</PrimaryButton>
						: <DisabledButton>Invalid folder!</DisabledButton>
					}
				</Buttons>
			</Container>
		</ModalWindow>
	);
};

export default MoveEntriesModal;