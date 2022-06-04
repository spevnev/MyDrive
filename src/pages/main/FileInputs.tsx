import React, {FormEvent, useContext, useEffect, useRef, useState} from "react";
import DropZone from "components/DropZone";
import {useLazyQuery, useMutation} from "@apollo/client";
import {GET_ENTRIES_QUERY, UPLOAD_FILES_AND_FOLDERS_MUTATION, UPLOAD_FILES_MUTATION} from "./FileInputs.queries";
import {FileEntry, SimpleFileEntry} from "services/file/fileTypes";
import {uploadFileToS3} from "services/s3";
import {CacheContext, CurrentDataContext} from "./index";
import {getData} from "services/token";
import UploadEntriesModal, {ModalData} from "./modals/UploadEntriesModal";
import {Trie} from "dataStructures/trie";
import styled from "styled-components";
import {
	dataTransferToEntries,
	filesToEntries,
	foldersArrayToPaths,
	folderToEntries,
	getFolderByPath,
	getFolderPath,
	renameToAvoidNamingCollisions,
} from "../../services/file/file";
import imageCompression from "browser-image-compression";
import {GET_ENTRY_SHARE_ID_QUERY} from "./index.queries";

const Hidden = styled.div`
  display: none;
`;

type FileInputsProps = {
	isDropZoneVisible: boolean;
	setIsDropZoneVisible: (arg: boolean) => void;
	setLoading: (id: number, change: number) => void;
}

const trie = new Trie();
const FileInputs = ({setIsDropZoneVisible, isDropZoneVisible = false, setLoading}: FileInputsProps) => {
	const {currentFolderId, folders, sharedFolders, space_used} = useContext(CurrentDataContext);
	const {cacheCurrentEntries, cacheFolders, cacheImagePreviews} = useContext(CacheContext);

	const [uploadFilesMutation] = useMutation(UPLOAD_FILES_MUTATION);
	const [uploadFilesAndFoldersMutation] = useMutation(UPLOAD_FILES_AND_FOLDERS_MUTATION);
	const [getEntriesQuery] = useLazyQuery(GET_ENTRIES_QUERY);
	const [getEntryShareIdQuery] = useLazyQuery(GET_ENTRY_SHARE_ID_QUERY);

	const [modalData, setModalData] = useState<ModalData | null>(null);
	const modalDataRef = useRef<ModalData | null>(null);
	modalDataRef.current = modalData;

	const editableSharedFolders = sharedFolders.filter(folder => folder.can_edit);

	useEffect(() => {
		if (modalData === null) return;

		trie.reset();
		trie.add("Drive");
		foldersArrayToPaths(folders).forEach(path => trie.add(`Drive${path}`));
		foldersArrayToPaths(editableSharedFolders, true).forEach(path => trie.add(`Shared${path}`));
	}, [folders, sharedFolders, modalData]);


	const isEntryImage = (entry: FileEntry) => {
		const extensions = [".jpg", ".jpeg", ".png"];
		return extensions.reduce((res, extension) => res ? true : entry.name.endsWith(extension), false);
	};

	const upload = async (parent_id: number, entries: FileEntry[], uploadMethod: (obj: any) => Promise<any>, getResult: (obj: any) => any, entryToKey: (obj: any) => string) => {
		const parentEntries = (await getEntriesQuery({variables: {parent_id}})).data.entries;
		entries = renameToAvoidNamingCollisions(entries, parentEntries) as FileEntry[];

		const result = await uploadMethod({variables: {parent_id, entries: entries.map(obj => ({...obj, data: undefined}))}});
		const data = getResult(result);
		if (data === null) return;

		const map = new Map<string, any>();
		data.forEach((cur: { [key: string]: any }) => map.set(cur.path, {...cur, path: undefined}));

		const {data: {entry}} = await getEntryShareIdQuery({variables: {id: parent_id}});
		const share_id = entry ? entry.share_id : null;

		entries.forEach(entry => {
			const {id, parent_id: cur_parent_id, url: uploadCredentials, additionalUrl} = map.get(entryToKey(entry));
			const name = entry.newName || entry.name;

			if (additionalUrl && isEntryImage(entry)) {
				imageCompression(new File([entry.data as ArrayBuffer], "FILENAME", {type: "image/png"}), {
					maxSizeMB: 0.01,
					maxWidthOrHeight: 90,
					useWebWorker: true,
				}).then(compressed => {
					uploadFileToS3(additionalUrl.url, additionalUrl.fields, undefined, compressed);
					cacheImagePreviews(id, compressed);
				});
			}

			if (entry.is_directory) cacheFolders({name, id, parent_id: cur_parent_id, share_id, bin_data: null});
			if (cur_parent_id === currentFolderId && parent_id === cur_parent_id)
				cacheCurrentEntries({name, id, parent_id: cur_parent_id, is_directory: entry.is_directory || false});

			if (entry.name && entry.data) {
				if (parent_id !== cur_parent_id) setLoading(cur_parent_id, 1);
				setLoading(id, 1);

				uploadFileToS3(uploadCredentials.url, uploadCredentials.fields, entry.data).then(() => {
					if (parent_id !== cur_parent_id) setLoading(cur_parent_id, -1);
					setLoading(id, -1);
				});
			}
		});
	};

	const uploadFiles = async (parent_id: number, entries: SimpleFileEntry[]) => {
		await upload(parent_id, entries as FileEntry[], uploadFilesMutation, result => result.data.uploadFiles, entry => entry.newName || entry.name);
	};

	const uploadFilesAndFolders = async (parent_id: number, entries: FileEntry[]) => {
		entries.sort((a, b) => {
			if (!a.path) return -1;
			if (!b.path) return 1;

			return a.path.split("/").length - b.path.split("/").length;
		});

		await upload(parent_id, entries, uploadFilesAndFoldersMutation, result => result.data.uploadFilesAndFolders, entry => entry.path ? `${entry.path}/${entry.name}` : entry.name);
	};

	const onContinueGenerator = (files: any[], cb: (parent_id: number, includedFiles: any[]) => void) => () => {
		const includedFiles = files.filter((_, i) => modalDataRef.current?.included[i]);

		setModalData(null);
		cb(getCurrentFolderId(), includedFiles);
	};

	const getCurrentFolderId = (): number => {
		const modalData = modalDataRef.current;
		if (!modalData || !modalData.input) return -1;

		if (modalData.input.startsWith("Drive")) return getFolderByPath(folders, modalData.input.slice(5)) || getData()?.drive_id;
		return getFolderByPath(editableSharedFolders, modalData.input.split("/").slice(2).join("/")) || -1;
	};

	const getCurrentFolderPath = (): string => {
		const drivePath = getFolderPath(folders, currentFolderId);
		const sharedPath = getFolderPath(editableSharedFolders, currentFolderId);
		const name = sharedPath ? editableSharedFolders.filter(folder => folder.id === currentFolderId)[0].username : "";

		return drivePath ? `Drive${drivePath}` : sharedPath ? `Shared/${name}${sharedPath}` : "Drive";
	};

	const getFiles = (e: FormEvent): File[] | null => {
		const target: HTMLInputElement | null = e.target as HTMLInputElement;
		if (target === null) return null;

		const list: FileList | null = target.files;
		if (list === null) return null;
		target.files = new DataTransfer().files; // creating empty FileList to reset the file input
		return [...list].filter(file => file.name !== ".DS_Store");
	};

	const onFileInput = (e: FormEvent) => {
		const files: File[] | null = getFiles(e);
		if (!files || !folders || !currentFolderId) return;

		const included: boolean[] = new Array(files.length).fill(true);
		const onContinue = onContinueGenerator(files, async (parent_id, includedFiles) => await uploadFiles(parent_id, await filesToEntries(includedFiles)));

		setModalData({files, included, onContinue, input: getCurrentFolderPath()});
	};

	const onFolderInput = (e: FormEvent) => {
		const files: File[] | null = getFiles(e);
		if (!files || !folders || !currentFolderId) return;

		const included: boolean[] = new Array(files.length).fill(true);
		const onContinue = onContinueGenerator(files, async (parent_id, includedFiles) => await uploadFilesAndFolders(parent_id, await folderToEntries(includedFiles)));

		setModalData({files, included, onContinue, input: getCurrentFolderPath()});
	};

	const onDrop = async (e: any) => {
		e.preventDefault();
		setIsDropZoneVisible(false);

		const {fileEntries, simpleFileEntries} = await dataTransferToEntries(e.dataTransfer.items);
		if (!folders || !currentFolderId) return;

		const input = getCurrentFolderPath();
		if (fileEntries) {
			const included: boolean[] = new Array(fileEntries.length).fill(true);
			const onContinue = onContinueGenerator(fileEntries, uploadFilesAndFolders);

			setModalData({files: fileEntries, included, onContinue, input});
		} else if (simpleFileEntries) {
			const included: boolean[] = new Array(simpleFileEntries.length).fill(true);
			const onContinue = onContinueGenerator(simpleFileEntries, uploadFiles);

			setModalData({files: simpleFileEntries, included, onContinue, input});
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

export default FileInputs;