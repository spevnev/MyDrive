import React, {FormEvent, useContext, useEffect, useState} from "react";
import DropZone from "components/DropZone";
import {useLazyQuery, useMutation} from "@apollo/client";
import {GET_ENTRIES_QUERY, UPLOAD_FILES_AND_FOLDERS_MUTATION, UPLOAD_FILES_MUTATION} from "./Inputs.queries";
import {dataTransferToEntries, filesToEntries, folderToEntries, getFolderByPath, getFolderPath, renameToAvoidNamingCollisions} from "services/file/fileRequest";
import {FileEntry, FolderArrayElement, SimpleFileEntry} from "services/file/fileTypes";
import {uploadFile} from "services/s3";
import {CacheContext, CurrentDataContext, Entry} from "./index";
import {getData} from "services/token";
import UploadEntriesModal, {ModalData} from "./modals/UploadEntriesModal";
import {Trie} from "dataStructures/trie";
import {foldersArrayToPaths} from "services/file/fileResponse";
import styled from "styled-components";

const Hidden = styled.div`
  display: none;
`;

type InputsProps = {
	isDropZoneVisible: boolean;
	setIsDropZoneVisible: (arg: boolean) => void;
	stopLoading: (id: number) => void;
}

let callbackModalData: ModalData | null = null;
const trie = new Trie();
const Inputs = ({setIsDropZoneVisible, isDropZoneVisible = false, stopLoading}: InputsProps) => {
	const {currentFolderId, folders, space_used} = useContext(CurrentDataContext);
	const {addFoldersToCache, addCurrentEntriesToCacheAndSetLoading} = useContext(CacheContext);

	const [uploadFilesMutation] = useMutation(UPLOAD_FILES_MUTATION);
	const [uploadFilesAndFoldersMutation] = useMutation(UPLOAD_FILES_AND_FOLDERS_MUTATION);
	const [getEntriesQuery] = useLazyQuery(GET_ENTRIES_QUERY);

	const [modalData, setModalData] = useState<ModalData | null>(null);

	useEffect(() => {
		callbackModalData = modalData;
		if (modalData === null) return;

		trie.reset();
		foldersArrayToPaths(folders).forEach(path => trie.add(path));
	}, [folders, modalData]);


	const upload = async (parent_id: number | null, entries: FileEntry[], uploadMethod: (obj: any) => Promise<any>, getResult: (obj: any) => any, entryToKey: (obj: any) => string) => {
		const {drive_id} = getData() || {};
		parent_id = parent_id || drive_id;

		const parentEntries = (await getEntriesQuery({variables: {parent_id}})).data.entries;
		entries = renameToAvoidNamingCollisions(entries, parentEntries) as FileEntry[];

		const result = await uploadMethod({variables: {parent_id, entries: entries.map(obj => ({...obj, data: undefined}))}});
		const data = getResult(result);
		if (data === null) return;

		const map = new Map<string, any>();
		data.forEach((cur: { [key: string]: any }) => map.set(cur.path, {...cur, path: undefined}));

		const foldersToBeCached: FolderArrayElement[] = [];
		const entriesToBeCached: Entry[] = []; // entries of current folder

		entries.forEach(entry => {
			const {id, parent_id: cur_parent_id, url: uploadCredentials} = map.get(entryToKey(entry));
			const name = entry.newName || entry.name;

			if (parent_id === cur_parent_id) entriesToBeCached.push({name, id, parent_id: cur_parent_id, is_directory: entry.is_directory || false});

			if (entry.is_directory) foldersToBeCached.push({name, id, parent_id: cur_parent_id});
			else if (entry.name && entry.data) uploadFile(uploadCredentials.url, uploadCredentials.fields, entry.data).then(() => stopLoading(id));
		});

		addCurrentEntriesToCacheAndSetLoading(...entriesToBeCached);
		addFoldersToCache(...foldersToBeCached);
	};

	const uploadFiles = async (parent_id: number | null, entries: SimpleFileEntry[]) => {
		await upload(parent_id, entries as FileEntry[], uploadFilesMutation, result => result.data.uploadFiles, entry => entry.newName || entry.name);
	};

	const uploadFilesAndFolders = async (parent_id: number | null, entries: FileEntry[]) => {
		entries.sort((a, b) => {
			if (!a.path) return -1;
			if (!b.path) return 1;

			return a.path.split("/").length - b.path.split("/").length;
		});

		await upload(parent_id, entries, uploadFilesAndFoldersMutation, result => result.data.uploadFilesAndFolders, entry => entry.path ? `${entry.path}/${entry.name}` : entry.name);
	};

	const onContinueGenerator = (files: any[], cb: (parent_id: number | null, includedFiles: any[]) => void) => () => {
		if (callbackModalData === null) return;
		// @ts-ignore
		const includedFiles = files.filter((_, i) => callbackModalData.included[i]);
		const parent_id = getFolderByPath(folders, callbackModalData.input || "/");

		setModalData(null);
		cb(parent_id, includedFiles);
	};

	const getFiles = (e: FormEvent): File[] | null => {
		const target: HTMLInputElement | null = e.target as HTMLInputElement;
		if (target === null) return null;

		const list: FileList | null = target.files;
		if (list === null) return null;
		target.files = new DataTransfer().files; // empty FileList to reset input
		return [...list].filter(file => file.name !== ".DS_Store");
	};

	const onFileInput = (e: FormEvent) => {
		const files: File[] | null = getFiles(e);
		if (!files || !folders || !currentFolderId) return;

		const included: boolean[] = new Array(files.length).fill(true);
		const onContinue = onContinueGenerator(files, async (parent_id, includedFiles) => await uploadFiles(parent_id, await filesToEntries(includedFiles)));

		setModalData({files, included, onContinue, input: getFolderPath(folders, currentFolderId) || "/"});
	};

	const onFolderInput = (e: FormEvent) => {
		const files: File[] | null = getFiles(e);
		if (!files || !folders || !currentFolderId) return;

		const included: boolean[] = new Array(files.length).fill(true);
		const onContinue = onContinueGenerator(files, async (parent_id, includedFiles) => await uploadFilesAndFolders(parent_id, await folderToEntries(includedFiles)));

		setModalData({files, included, onContinue, input: getFolderPath(folders, currentFolderId) || "/"});
	};

	const onDrop = async (e: any) => {
		e.preventDefault();
		setIsDropZoneVisible(false);

		const {fileEntries, simpleFileEntries} = await dataTransferToEntries(e.dataTransfer.items);
		if (!folders || !currentFolderId) return;

		if (fileEntries) {
			const included: boolean[] = new Array(fileEntries.length).fill(true);
			const onContinue = onContinueGenerator(fileEntries, uploadFilesAndFolders);

			setModalData({files: fileEntries, included, onContinue, input: getFolderPath(folders, currentFolderId) || "/"});
		} else if (simpleFileEntries) {
			const included: boolean[] = new Array(simpleFileEntries.length).fill(true);
			const onContinue = onContinueGenerator(simpleFileEntries, uploadFiles);

			setModalData({files: simpleFileEntries, included, onContinue, input: getFolderPath(folders, currentFolderId) || "/"});
		}
	};

	const changeIncluded = (includeHidden: boolean) => {
		if (!modalData) return;
		setModalData({...modalData, included: modalData.files.map(({name}) => includeHidden ? true : !name.startsWith("."))});
	};


	const GB = 2 ** 30;
	const freeSpace = GB - space_used;

	return (
		<>
			<Hidden>
				{/* @ts-ignore */}
				<input id="folderUpload" type="file" onInput={onFolderInput} webkitdirectory="true" directory="true"/>
				<input id="fileUpload" type="file" onInput={onFileInput} multiple/>
			</Hidden>

			{modalData !== null && <UploadEntriesModal trie={trie} modalData={modalData} freeSpace={freeSpace} setModalData={setModalData} changeIncluded={changeIncluded}/>}
			{isDropZoneVisible && <DropZone onDrop={onDrop}/>}
		</>
	);
};

export default Inputs;