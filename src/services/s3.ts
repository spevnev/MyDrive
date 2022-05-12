export const uploadFile = async (url: string, fields: { [key: string]: string }, data: ArrayBuffer): Promise<boolean> => {
	const body = {
		"X-Amz-Algorithm": fields.Algorithm,
		"X-Amz-Credential": fields.Credential,
		"X-Amz-Date": fields.Date,
		"X-Amz-Signature": fields.Signature,
		Policy: fields.Policy,
		key: fields.key,
		file: new File([data], "FILENAME"),
	};

	const formData = new FormData();
	Object.entries(body).forEach(e => formData.set(...e));

	// TODO: disabled due to free tier limitation
	// const response = await fetch(url, {method: "POST", body: formData});
	const response = await new Promise(resolve => setTimeout(() => resolve({status: 204}), 70)) as { status: number };
	return response.status === 204;
};