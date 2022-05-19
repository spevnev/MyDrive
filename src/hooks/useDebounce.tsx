import {useEffect, useState} from "react";

let ids = 0;
const data: { [key: number]: [NodeJS.Timeout | null, any] } = {};
const useDebounce = () => {
	const [id] = useState(++ids);

	useEffect(() => {
		data[id] = [null, null];
		return () => {delete data[id];};
	});

	return (timeoutMs: number, callback: (data: any) => void) => (changeData: (data: any) => any) => {
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