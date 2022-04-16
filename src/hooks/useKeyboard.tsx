import {useEffect, useState} from "react";

type UseKeyboardProps = {
	key: string;
	priority?: number;
	cb: (e: KeyboardEvent) => void;
};

type KeyObject = {
	cb: (e: KeyboardEvent) => void;
	key: string;
	id: number;
	priority: number;
};

let id = 0;
let keys: KeyObject[] = [];
const useKeyboard = ({key, cb, priority = 0}: UseKeyboardProps) => {
	const [curId] = useState(++id);

	useEffect(() => {
		keys = keys.filter(obj => obj.id !== curId);
		keys.push({key, cb, priority, id: curId});
		keys.sort((a, b) => b.priority - a.priority);

		return () => {
			keys = keys.filter(obj => obj.id !== curId);
		};
	}, [cb, curId, key, priority]);
};

window.onkeydown = e => {
	for (let i = 0; i < keys.length; i++) {
		if (keys[i].key === e.key) keys[i].cb(e);
	}
};

export default useKeyboard;