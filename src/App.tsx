import React from "react";
import styled from "styled-components";

const Style = styled.p`
  font-size: 24px;
  color: black;
  background: rebeccapurple;
  width: 200px;
  height: 200px;
  display: block;
  font-family: sans-serif;
  font-weight: 900;
  text-decoration: underline;
  text-shadow: 5px 5px 5px blue;
`;


const App = () => {
	return (
		<Style>Hello world!</Style>
	);
};

export default App;
