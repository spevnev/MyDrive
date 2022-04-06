import React from "react";
import styled from "styled-components";

type LinkButtonProps = {
	color?: string;
}

export default styled.div<LinkButtonProps>`
  cursor: pointer;
  text-decoration: underline;
`;