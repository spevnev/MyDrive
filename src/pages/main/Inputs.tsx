import React, {FormEvent, useEffect, useState} from "react";
import DropZone from "../../components/DropZone";
import {useLazyQuery, useMutation} from "@apollo/client";
import {GET_ENTRIES_QUERY, UPLOAD_FILES_AND_FOLDERS_MUTATION, UPLOAD_FILES_MUTATION} from "./Inputs.queries";
import {Button, Buttons, Container, Header, Hidden, PrimaryButton} from "./Inputs.styles";
import ModalWindow from "../../components/ModalWindow";
import Checkbox from "../../components/Checkbox";
import {dataTransferToEntries, filesToEntries, folderToEntries, getFolderByPath, getFolderPath, renameToAvoidNamingCollisions} from "../../services/file/fileRequest";
import AutoCompleteInput from "../../components/AutoCompleteInput";
import {Trie} from "../../dataStructures/trie";
import {foldersArrayToPaths} from "../../services/file/fileResponse";
import {FileEntry, FolderArrayElement, SimpleFileEntry} from "../../services/file/fileTypes";
import {uploadFile} from "../../services/s3";

type InputsProps = {
	isDropZoneVisible: boolean;
	setIsDropZoneVisible: (arg: boolean) => void;
	currentFolderId: number | null;
	folders: FolderArrayElement[];
}

type ModalData = {
	files: File[] | FileEntry[] | SimpleFileEntry[];
	included: boolean[];
	input: string | null;
	onContinue: Function;
}

const trie = new Trie();
let callbackModalData: ModalData | null = null;
const Inputs = ({setIsDropZoneVisible, isDropZoneVisible = false, currentFolderId, folders}: InputsProps) => {
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


	const uploadFiles = async (parent_id: number | null, entries: SimpleFileEntry[]) => {
		const parentEntries = (await getEntriesQuery({variables: {parent_id}})).data.entries;
		entries = renameToAvoidNamingCollisions(entries as FileEntry[], parentEntries);

		const result = await uploadFilesMutation({variables: {parent_id, entries: entries.map(obj => ({...obj, data: undefined}))}});
		const data = result.data.uploadFiles;
		if (data === null) return;

		const pathToPresignedURL = new Map<string, { url: string, fields: { [key: string]: string } }>();
		data.forEach((cur: { [key: string]: any }) => pathToPresignedURL.set(cur.path, {...cur.url, __typename: undefined}));

		entries.forEach(entry => {
			if (!entry.data || !entry.name) return;

			const {url, fields} = pathToPresignedURL.get(entry.newName || entry.name) || {};
			uploadFile(url || "", fields || {}, entry.data);
		});
	};

	const uploadFilesAndFolders = async (parent_id: number | null, entries: FileEntry[]) => {
		entries.sort((a, b) => {
			if (!a.path) return -1;
			if (!b.path) return 1;

			return a.path.split("/").length - b.path.split("/").length;
		});

		const parentEntries = (await getEntriesQuery({variables: {parent_id}})).data.entries;
		entries = renameToAvoidNamingCollisions(entries, parentEntries) as FileEntry[];

		const result = await uploadFilesAndFoldersMutation({variables: {parent_id, entries: entries.map(obj => ({...obj, data: undefined}))}});
		const data = result.data.uploadFilesAndFolders;
		if (data === null) return;

		const pathToPresignedURL = new Map<string, { url: string, fields: { [key: string]: string } }>();
		data.forEach((cur: { [key: string]: any }) => pathToPresignedURL.set(cur.path, {...cur.url, __typename: undefined}));

		entries.forEach(entry => {
			if (!entry.data || !entry.name) return;

			const {url, fields} = pathToPresignedURL.get(`${entry.path}/${entry.name}`) || {};
			uploadFile(url || "", fields || {}, entry.data);
		});
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
		const onContinue = onContinueGenerator(files, async (parent_id, includedFiles) => await uploadFiles(parent_id, await folderToEntries(includedFiles)));

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

	const roundTo = (num: number, digits: number) => Math.floor(num * 10 ** digits) / 10 ** digits;

	const getSizeInString = (files: SimpleFileEntry[]) => {
		if (!modalData) return;
		const bytes = files.reduce((sum, {size}, i) => sum + (modalData.included[i] ? size : 0), 0);

		const KB = 2 ** 10;
		const MB = 2 ** 20;

		if (bytes < KB) return "less than a KB";
		else if (bytes < MB) return `${roundTo(bytes / KB, 2)}KBs`;
		return `${roundTo(bytes / MB, 2)}MBs`;
	};

	const changeIncluded = (includeHidden: boolean) => {
		if (!modalData) return;
		setModalData({...modalData, included: modalData.files.map(({name}) => includeHidden ? true : !name.startsWith("."))});
	};


	return (
		<>
			<Hidden>
				{/* @ts-ignore */}
				<input id="folderUpload" type="file" onInput={onFolderInput} webkitdirectory="true" directory="true"/>
				<input id="fileUpload" type="file" onInput={onFileInput} multiple/>
			</Hidden>

			{modalData !== null &&
				<ModalWindow isOpened={true}>
					<Container>
						<Header>Uploading {modalData.included.reduce((sum, cur) => sum + (cur ? 1 : 0), 0)} files, {getSizeInString(modalData.files)}</Header>
						<AutoCompleteInput placeholder="Path" initialValue={modalData.input} trie={trie} onChange={value => setModalData({...modalData, input: value})}/>
						<Checkbox defaultValue={true} onChange={changeIncluded}>Upload hidden files (start with .)</Checkbox>
						<Buttons>
							<Button onClick={() => setModalData(null)}>Cancel</Button>
							<PrimaryButton onClick={() => modalData.onContinue()}>OK</PrimaryButton>
						</Buttons>
					</Container>
				</ModalWindow>
			}
			{isDropZoneVisible && <DropZone onDrop={onDrop}/>}
		</>
	);
};

export default Inputs;