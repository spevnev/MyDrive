import React from "react";
import styled from "styled-components";

type ProgressBarProps = {
	fillPercent: number;
}

const Block = styled.div`
  height: 100%;
  background: #5555fe;
`;

const Container = styled.div`
  height: 15px;
  border-radius: 100px;
  overflow: hidden;
  position: relative;
  background: #d8d8d8;
`;

const ProgressBar = ({fillPercent}: ProgressBarProps) => {
	return (
		<Container>
			<Block style={{width: `${fillPercent}%`}}/>
		</Container>
	);
};

export default ProgressBar;