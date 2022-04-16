import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

const usePath = (path: string = "/") => {
	const navigate = useNavigate();

	useEffect(() => navigate(`${document.location.pathname}#${path}`, {replace: true}), [path]);
};

export default usePath;