import React from "react";
import {Container, Logo, Title, TitleContainer, Username} from "./Header.styles";
import {useNavigate} from "react-router-dom";
import {getData} from "services/token";

const Header = () => {
	const navigate = useNavigate();
	const tokenData = getData();


	return (
		<Container>
			<TitleContainer onClick={() => navigate("/")}>
				<Logo/>
				<Title>My Drive</Title>
			</TitleContainer>

			<Username>{tokenData ? tokenData.username || "" : ""}</Username>
		</Container>
	);
};

export default Header;