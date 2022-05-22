import React from "react";
import App from "./App";
import GlobalStyles from "./index.styles";
// @ts-ignore
import {createRoot} from "react-dom/client";
import {ApolloClient, ApolloLink, ApolloProvider, concat, HttpLink, InMemoryCache} from "@apollo/client";
import {BrowserRouter} from "react-router-dom";
import {getToken} from "./services/token";

const loading: Element | null = document.getElementById("loading");
if (loading) setTimeout(() => loading.remove(), 200);

const httpLink = new HttpLink({uri: "http://127.0.0.1:3001/graphql"});
const requestInterceptor = new ApolloLink((operation, forward) => {
	const jwt = getToken();
	if (jwt) {
		operation.setContext(({headers = {}}) => ({
			headers: {
				...headers,
				authorization: jwt,
			},
		}));
	}

	return forward(operation);
});

export const client = new ApolloClient({
	cache: new InMemoryCache({
		typePolicies: {
			Query: {
				fields: {
					entries: {
						read: _ => _,
						merge: (_, incoming) => _ ? incoming : _,
					},
				},
			},
		},
	}),
	link: concat(requestInterceptor, httpLink),
	connectToDevTools: false,

});

const root: Element | null = document.getElementById("root");
if (!root) throw new Error("Couldn't mount app - no element matched the selector!");
const app = createRoot(root);

app.render(
	<BrowserRouter>
		<ApolloProvider client={client}>
			<GlobalStyles/>
			<App/>
		</ApolloProvider>
	</BrowserRouter>,
);