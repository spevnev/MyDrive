import React, {useEffect, useState} from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {getToken} from "./services/jwt";
import MainPage from "./pages/main";
import LoginPage from "./pages/login";

const App = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);


	const checkAuthentication = () => setIsAuthenticated(!!getToken());
	useEffect(checkAuthentication, []);


	return (
		<Routes>
			<Route index element={isAuthenticated ? <MainPage/> : <Navigate to="/login"/>}/>
			<Route path="login" element={!isAuthenticated ? <LoginPage checkAuthentication={checkAuthentication}/> : <Navigate to="/"/>}/>
		</Routes>
	);
};

export default App;
