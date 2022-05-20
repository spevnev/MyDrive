let idCount = 0;
const data: { [key: number]: [NodeJS.Timeout | null, any] } = {};

const useDebounce = () => (timeoutMs: number, callback: (data: any) => void) => {
	const id = ++idCount;
	data[id] = [null, null];

	return (changeData: (data: any) => any) => {
		const [curTimeout, curData] = data[id];
		if (curTimeout !== null) clearTimeout(curTimeout);

		const newData = changeData(curData);
		data[id] = [
			setTimeout(() => {
				data[id][0] = null;
				callback(newData);
			}, timeoutMs),
			newData,
		];
	};
};

export default useDebounce;