import React from "react";
import App from "./App";
import GlobalStyles from "./styles";
import * as ReactDOMClient from "react-dom/client";


const root: Element | null = document.getElementById("root");
if (!root) throw new Error("Couldn't mount app - no element matched the selector!");
const app = ReactDOMClient.createRoot(root);

app.render(
	<>
		<GlobalStyles/>
		<App/>
	</>,
);