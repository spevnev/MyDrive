import React from "react";
import AutoCompleteInput from "components/AutoCompleteInput";
import Checkbox from "components/Checkbox";
import ModalWindow from "components/ModalWindow";
import {FileEntry, SimpleFileEntry} from "services/file/fileTypes";
import {Trie} from "dataStructures/trie";
import {Button, Buttons, Container, DisabledButton, Header, PrimaryButton} from "./Modal.styles";

export type ModalData = {
	files: File[] | FileEntry[] | SimpleFileEntry[];
	included: boolean[];
	input: string | null;
	onContinue: Function;
}

type UploadEntriesModalProps = {
	modalData: ModalData;
	setModalData: (arg: ModalData | null) => void;
	freeSpace: number;
	changeIncluded: (arg: boolean) => void;
	trie: Trie;
}

const UploadEntriesModal = ({modalData, setModalData, freeSpace, changeIncluded, trie}: UploadEntriesModalProps) => {
	const roundTo = (num: number, digits: number) => Math.floor(num * 10 ** digits) / 10 ** digits;

	const getSize = (files: SimpleFileEntry[]): number => {
		if (!modalData) return 0;
		return files.reduce((sum, {size}, i) => sum + (modalData.included[i] ? size : 0), 0);
	};

	const getSizeInString = (files: SimpleFileEntry[]): string => {
		if (!modalData) return "";
		const bytes = getSize(files);

		const KB = 2 ** 10;
		const MB = 2 ** 20;

		if (bytes < KB) return "less than a KB";
		else if (bytes < MB) return `${roundTo(bytes / KB, 2)}KBs`;
		return `${roundTo(bytes / MB, 2)}MBs`;
	};


	return (
		<ModalWindow isOpen={true}>
			<Container>
				<Header>Uploading {modalData.included.reduce((sum, cur) => sum + (cur ? 1 : 0), 0)} files, {getSizeInString(modalData.files)}</Header>

				<AutoCompleteInput placeholder="Path" initialValue={modalData.input} trie={trie} onChange={value => setModalData({...modalData, input: value})}/>
				<Checkbox defaultValue={true} onChange={changeIncluded}>Upload hidden files (start with .)</Checkbox>

				<Buttons>
					<Button onClick={() => setModalData(null)}>Cancel</Button>
					{freeSpace > getSize(modalData.files)
						? <PrimaryButton onClick={() => modalData.onContinue()}>OK</PrimaryButton>
						: <DisabledButton>Not enough space!</DisabledButton>
					}
				</Buttons>
			</Container>
		</ModalWindow>
	);
};

export default UploadEntriesModal;