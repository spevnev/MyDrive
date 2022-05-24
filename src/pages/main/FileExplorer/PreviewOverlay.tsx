import React, {useEffect, useState} from "react";
import {Cross, Image, Overlay} from "./PreviewOverlay.styles";
import Spinner from "components/Spinner";
import {useLazyQuery} from "@apollo/client";
import {GET_IMAGE_PRESIGNED_URL} from "./PreviewOverlay.queries";
import {Entry} from "../index";

type PreviewOverlayProps = {
	data: Entry | null;
	setIsOpen: (arg: null) => void;
}

const PreviewOverlay = ({data, setIsOpen}: PreviewOverlayProps) => {
	const [src, setSrc] = useState<string | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const [getImagePresignedUrlQuery] = useLazyQuery(GET_IMAGE_PRESIGNED_URL);


	const showError = () => setErrorMsg("Error loading the image!");

	useEffect(() => {
		setSrc(null);
		if (!data) return showError();
		setErrorMsg(null);

		getImagePresignedUrlQuery({variables: {file_id: data.id}}).then(res => {
			const {data} = res;
			if (!data) return showError();

			const url = data.entryPresignedUrl;
			if (!url) return showError();

			fetch(url).then(result => {
				if (result.status !== 200) return showError();

				result.blob().then(blob => setSrc(URL.createObjectURL(blob)));
			});
		});
	}, [data]);


	if (data === null) return null;

	return (
		<Overlay>
			<Cross onClick={() => setIsOpen(null)}/>

			{errorMsg === null
				? src === null
					? <Spinner size={100}/>
					: <Image src={src}/>
				: <h1>{errorMsg}</h1>
			}
		</Overlay>
	);
};

export default PreviewOverlay;