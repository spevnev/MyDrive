import React, {MouseEvent, useContext} from "react";
import {Container, FileImage, Filename} from "./File.styles";
import imageFile from "../../assets/file-picture.svg";
import textFile from "../../assets/file-text.svg";
import musicFile from "../../assets/file-music.svg";
import pdfFile from "../../assets/file-pdf.svg";
import videoFile from "../../assets/file-play.svg";
import excelFile from "../../assets/file-excel.svg";
import wordFile from "../../assets/file-word.svg";
import compressedFile from "../../assets/file-zip.svg";
import emptyFile from "../../assets/file-empty.svg";
import {ContextMenuContext} from "./index";
import contextMenuOptionsFactory, {EContextMenuOptions} from "../../service/contextMenuOptionFactory";
import {ContextMenuOption} from "../../components/ContextMenu";

const defaultImageType: string = emptyFile;
const typeToImage: { [key: string]: string } = {
	IMAGE: imageFile,
	TEXT: textFile,
	MUSIC: musicFile,
	PDF: pdfFile,
	VIDEO: videoFile,
	EXCEL: excelFile,
	WORD: wordFile,
	COMPRESSED: compressedFile,
};

type FileProps = {
	filename: string;
	type: string;
	isSelected: boolean;
	onClick: (e: MouseEvent) => void;
}

const File = ({filename, type, isSelected, onClick}: FileProps) => {
	const {openContextMenu}: { [key: string]: Function } = useContext(ContextMenuContext);


	const onDelete = () => console.log(1);

	const onDownload = () => console.log(1);

	const onRename = () => console.log(1);

	const onGetLink = () => console.log(1);

	const onShare = () => console.log(1);

	const onMoveTo = () => console.log(1);

	const onContextMenu = (e: MouseEvent) => {
		const contextMenuData: object = {onDelete, onDownload, onRename, onGetLink, onShare, onMoveTo};
		const options: ContextMenuOption[] | null = contextMenuOptionsFactory(EContextMenuOptions.FILE, contextMenuData);
		if (!options) throw new Error("Invalid context menu type!");

		e.preventDefault();
		e.stopPropagation();

		openContextMenu(e.pageX, e.pageY, options);
	};


	return (
		<Container className={isSelected ? "selected" : ""} onContextMenuCapture={onContextMenu} onClick={onClick}>
			<FileImage src={typeToImage[type] || defaultImageType}/>
			<Filename>{filename}</Filename>
		</Container>
	);
};

export default File;