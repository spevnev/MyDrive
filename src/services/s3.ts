export const uploadFileToS3 = async (url: string, fields: { [key: string]: string }, data?: ArrayBuffer, file?: File): Promise<boolean> => {
	if (data === undefined && file === undefined) throw new Error("No data!");

	const body = {
		"X-Amz-Algorithm": fields.Algorithm,
		"X-Amz-Credential": fields.Credential,
		"X-Amz-Date": fields.Date,
		"X-Amz-Signature": fields.Signature,
		Policy: fields.Policy,
		key: fields.key,
		file: file || new File([data as ArrayBuffer], "FILENAME"),
	};

	const formData = new FormData();
	// @ts-ignore
	Object.entries(body).forEach(e => formData.set(...e));

	const response = await fetch(url, {method: "POST", body: formData});
	return response.status === 204;
};