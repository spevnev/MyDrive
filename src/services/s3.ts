export const uploadFileToS3 = async (url: string, fields: { [key: string]: string }, data?: ArrayBuffer, file?: File): Promise<boolean> => {
	const body = {
		"X-Amz-Algorithm": fields.Algorithm,
		"X-Amz-Credential": fields.Credential,
		"X-Amz-Date": fields.Date,
		"X-Amz-Signature": fields.Signature,
		...(fields.key.endsWith("preview") ? {acl: "public-read"} : {}),
		Policy: fields.Policy,
		key: fields.key,
		file: file || data,
	};

	const formData = new FormData();
	// @ts-ignore
	Object.entries(body).forEach(e => formData.set(...e));

	// const response = await fetch(url, {method: "POST", body: formData});
	const response = await new Promise(resolve => setTimeout(() => resolve({status: 204}), 70)) as { status: number };
	return response.status === 204;
};