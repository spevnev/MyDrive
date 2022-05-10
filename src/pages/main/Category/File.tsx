import React, {MouseEvent, useContext} from "react";
import {Container, FileImage, Filename} from "./File.styles";
import imageFile from "assets/file-picture.svg";
import textFile from "assets/file-text.svg";
import musicFile from "assets/file-music.svg";
import pdfFile from "assets/file-pdf.svg";
import videoFile from "assets/file-play.svg";
import excelFile from "assets/file-excel.svg";
import wordFile from "assets/file-word.svg";
import compressedFile from "assets/file-zip.svg";
import emptyFile from "assets/file-empty.svg";
import {ContextMenuContext} from "../index";
import {EContextMenuTypes} from "helpers/contextMenuOptionFactory";
import Spinner from "components/Spinner";

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
	filename: string;
	type: EFileType | null;
	isSelected: boolean;
	onClick: (e: MouseEvent) => void;
	isLoading: boolean;
}

const File = ({filename, type, isSelected, onClick, isLoading = false}: FileProps) => {
	const {openContextMenu}: { [key: string]: Function } = useContext(ContextMenuContext);


	const onDelete = () => console.log(8);

	const onDownload = () => console.log(7);

	const onRename = () => console.log(6);

	const onGetLink = () => console.log(5);

	const onShare = () => console.log(4);

	const onMoveTo = () => console.log(3);

	const onPreview = type !== EFileType.IMAGE ? undefined : () => console.log(1);

	const onContextMenu = (e: MouseEvent) => {
		const contextMenuData: object = {onDelete, onDownload, onRename, onGetLink, onShare, onMoveTo, onPreview};
		openContextMenu(e, contextMenuData, EContextMenuTypes.FILE);
	};


	return (
		<Container className={isSelected ? "selected" : ""} onContextMenuCapture={onContextMenu} onClick={onClick}>
			{isLoading ? <Spinner/> : <FileImage src={type === null ? defaultImage : images[type]}/>}
			<Filename>{filename}</Filename>
		</Container>
	);
};

export default File;