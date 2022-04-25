import decode, {JwtPayload} from "jwt-decode";

export const getToken = (): string | null => {
	const token = localStorage.getItem("JWT");
	if (!token) return null;

	const data: JwtPayload = decode(token);
	if (data.exp && data.exp < Date.now() / 1000) {
		localStorage.removeItem("JWT");
		return null;
	}

	return token;
};

export const getData = (): { [key: string]: any } | null => {
	const token = getToken();
	if (!token) return null;

	return decode(token);
};