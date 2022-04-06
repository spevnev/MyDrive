import decode, {JwtPayload} from "jwt-decode";

const getToken = (): string | null => {
	const token = localStorage.getItem("JWT");
	if (!token) return null;

	const data: JwtPayload = decode(token);
	if (data.exp && data.exp < Date.now() / 1000) {
		localStorage.removeItem("JWT");
		return null;
	}

	return token;
};

export default getToken;