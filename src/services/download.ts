export const downloadFile = (data: Blob | File, filename: string) => {
	const url = URL.createObjectURL(data);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
};