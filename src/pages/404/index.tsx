import React from "react";
import {Container, Page, StyledLink, Title} from "./index.styles";

const PageNotFound = () => {
	return (
		<Page>
			<Container>
				<Title>404 - Page Not Found</Title>
				<StyledLink to="/">To the Main page</StyledLink>
			</Container>
		</Page>
	);
};

export default PageNotFound;