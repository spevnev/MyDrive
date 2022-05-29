import React, {MouseEvent, useContext} from "react";
import {Container, FileIcon, FileImage, Filename} from "./File.styles";
import imageFile from "assets/file-picture.svg";
import textFile from "assets/file-text.svg";
import musicFile from "assets/file-music.svg";
import pdfFile from "assets/file-pdf.svg";
import videoFile from "assets/file-play.svg";
import excelFile from "assets/file-excel.svg";
import wordFile from "assets/file-word.svg";
import compressedFile from "assets/file-zip.svg";
import emptyFile from "assets/file-empty.svg";
import {BinData, ContextMenuContext, Entry} from "../index";
import {EContextMenuTypes} from "helpers/contextMenuOptionFactory";
import Spinner from "components/Spinner";
import {EntryActionsContext} from "../FileExplorer/FileExplorer";

const defaultImage: string = emptyFile;
const images: string[] = [imageFile, textFile, musicFile, pdfFile, videoFile, excelFile, wordFile, compressedFile, emptyFile];

export enum EFileType {
	IMAGE,
	TEXT,
	MUSIC,
	PDF,
	VIDEO,
	EXCEL,
	WORD,
	COMPRESSED,
	OTHER
}

type FileProps = {
	entry: Entry;
	type: EFileType | null;
	isSelected: boolean;
	onClick: (e: MouseEvent) => void;
	isLoading: boolean;
	imagePreview: Blob | null;
	binData: BinData | null;
}

const File = ({entry, type, isSelected, onClick, isLoading = false, imagePreview = null, binData}: FileProps) => {
	const {openContextMenu} = useContext(ContextMenuContext);
	const {onDelete, onDownload, onRename, onShare, onMoveTo, onPreview, onRestore, onInfo, onFullyDelete} = useContext(EntryActionsContext);


	const onContextMenu = (e: MouseEvent) => {
		if (binData) {
			const contextMenuData: object = {
				onRestore: () => onRestore(entry),
				onInfo: () => onInfo(entry),
				onFullyDelete: () => onFullyDelete(entry),
			};

			openContextMenu(e, contextMenuData, EContextMenuTypes.DELETED);
			return;
		}

		const canPreview = type === EFileType.IMAGE;
		const contextMenuData: object = {
			onDelete: () => onDelete(entry),
			onDownload: () => onDownload(entry),
			onRename: () => onRename(entry),
			onShare: () => onShare(entry),
			onMoveTo: () => onMoveTo(entry),
			onPreview: canPreview ? () => onPreview(entry) : undefined,
		};

		openContextMenu(e, contextMenuData, EContextMenuTypes.FILE);
	};


	return (
		<Container className={isSelected ? "selected" : ""} onContextMenuCapture={onContextMenu} onClick={onClick}>
			{isLoading ?
				<Spinner size={70} margin={true}/> :
				imagePreview === null ?
					<FileIcon src={type === null ? defaultImage : images[type]}/> :
					<FileImage src={URL.createObjectURL(imagePreview)}/>
			}
			<Filename>{entry.name}</Filename>
		</Container>
	);
};

export default File;