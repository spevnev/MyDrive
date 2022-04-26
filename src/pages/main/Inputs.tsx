import React, {FormEvent, useEffect, useState} from "react";
import DropZone from "../../components/DropZone";
import {useMutation} from "@apollo/client";
import {UPLOAD_FILES_AND_FOLDERS_MUTATION, UPLOAD_FILES_MUTATION} from "./Inputs.queries";
import {Button, Buttons, Container, Header, Hidden, PrimaryButton} from "./Inputs.styles";
import ModalWindow from "../../components/ModalWindow";
import Checkbox from "../../components/Checkbox";
import {
	dataTransferToEntries,
	FileEntry,
	filesToEntries,
	FolderArrayElement,
	foldersArrayToPaths,
	folderToEntries,
	getFolderByPath,
	getFolderPath,
	SimpleFileEntry,
} from "../../services/file";
import AutoCompleteInput from "../../components/AutoCompleteInput";
import {Trie} from "../../dataStructures/trie";

type InputsProps = {
	isDropZoneVisible: boolean;
	setIsDropZoneVisible: (arg: boolean) => void;
	currentFolderId: number | null;
	folders: FolderArrayElement[];
}

type ModalData = {
	files: File[];
	included: boolean[];
	input: string | null;
	onContinue: Function;
}

const trie = new Trie();
let callbackModalData: ModalData | null = null;
const Inputs = ({setIsDropZoneVisible, isDropZoneVisible = false, currentFolderId, folders}: InputsProps) => {
	const [uploadFilesMutation] = useMutation(UPLOAD_FILES_MUTATION);
	const [uploadFilesAndFoldersMutation] = useMutation(UPLOAD_FILES_AND_FOLDERS_MUTATION);

	const [modalData, setModalData] = useState<ModalData | null>(null);

	useEffect(() => {
		callbackModalData = modalData;
		if (modalData === null) return;

		trie.reset();
		foldersArrayToPaths(folders).forEach(path => trie.add(path));
	}, [folders, modalData]);


	const uploadFiles = (variables: { parent_id: number | null, entries: SimpleFileEntry[] }) => {
		uploadFilesMutation({variables}).then(result => {
			console.log(result);
		});
	};

	const uploadFilesAndFolders = (variables: { parent_id: number | null, entries: FileEntry[] }) => {
		// Sorting by shortest path (number of folders in path)
		variables.entries.sort((a, b) => (a.path || "").split("/").length - (b.path || "").split("/").length);

		uploadFilesAndFoldersMutation({variables}).then(result => {
			console.log(result);
		});
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

		const onContinue = () => {
			if (callbackModalData === null) return;
			// @ts-ignore
			const includedFiles = files.filter((_, i) => callbackModalData.included[i]);
			const parent_id = getFolderByPath(folders, callbackModalData.input || "/");

			setModalData(null);
			uploadFiles({
				entries: filesToEntries(includedFiles),
				parent_id,
			});
		};

		setModalData({files, included, onContinue, input: getFolderPath(folders, currentFolderId) || "/"});
	};

	const onFolderInput = (e: FormEvent) => {
		const files: File[] | null = getFiles(e);
		if (!files || !folders || !currentFolderId) return;
		const included: boolean[] = new Array(files.length).fill(true);

		const onContinue = () => {
			if (callbackModalData === null) return;
			// @ts-ignore
			const includedFiles = files.filter((_, i) => callbackModalData.included[i]);
			const parent_id = getFolderByPath(folders, callbackModalData.input || "/");

			setModalData(null);
			uploadFilesAndFolders({
				entries: folderToEntries(includedFiles),
				parent_id,
			});
		};

		setModalData({files, included, onContinue, input: getFolderPath(folders, currentFolderId) || "/"});
	};

	const onDrop = async (e: any) => {
		e.preventDefault();
		setIsDropZoneVisible(false);

		const {fileEntries, simpleFileEntries} = await dataTransferToEntries(e.dataTransfer.items);
		if (!folders || !currentFolderId) return;

		if (fileEntries) {
			const included: boolean[] = new Array(fileEntries.length).fill(true);

			const onContinue = () => {
				if (callbackModalData === null) return;
				// @ts-ignore
				const includedFiles = fileEntries.filter((_, i) => callbackModalData.included[i]);
				const parent_id = getFolderByPath(folders, callbackModalData.input || "/");

				setModalData(null);
				uploadFilesAndFolders({
					entries: includedFiles,
					parent_id,
				});
			};
			// @ts-ignore
			setModalData({files: fileEntries, included, onContinue, input: getFolderPath(folders, currentFolderId) || "/"});
		} else if (simpleFileEntries) {
			const included: boolean[] = new Array(simpleFileEntries.length).fill(true);

			const onContinue = () => {
				if (callbackModalData === null) return;
				// @ts-ignore
				const includedFiles = simpleFileEntries.filter((_, i) => callbackModalData.included[i]);
				const parent_id = getFolderByPath(folders, callbackModalData.input || "/");

				setModalData(null);
				uploadFiles({
					entries: includedFiles,
					parent_id,
				});
			};
			// @ts-ignore
			setModalData({files: simpleFileEntries, included, onContinue, input: getFolderPath(folders, currentFolderId) || "/"});
		}
	};

	const roundTo = (num: number, digits: number) => Math.floor(num * 10 ** digits) / 10 ** digits;

	const getSizeInString = (files: File[]) => {
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