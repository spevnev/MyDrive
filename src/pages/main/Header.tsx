import React from "react";
import {Container, Logo, Title, TitleContainer, Username} from "./Header.styles";
import {useNavigate} from "react-router-dom";

type HeaderProps = {
	username: string;
}

const Header = ({username = ""}: HeaderProps) => {
	const navigate = useNavigate();


	return (
		<Container>
			<TitleContainer onClick={() => navigate("/")}>
				<Logo/>
				<Title>My Drive</Title>
			</TitleContainer>

			<Username>{username}</Username>
		</Container>
	);
};

export default Header;