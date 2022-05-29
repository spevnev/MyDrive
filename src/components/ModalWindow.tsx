import React, {ReactElement} from "react";
import styled from "styled-components";

const Overlay = styled.div`
  width: 100vw;
  height: 100vh;
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  background: #000000aa;
  z-index: 9999;
`;

const Container = styled.div`
  background: #fbfbfb;
  border-radius: 8px;
  border: 1px solid #aaa;
  box-shadow: 2px 4px 4px rgba(0, 0, 0, .4);
  padding: 8px 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 20%;
  min-height: 15%;
  transform: translate(-50%, -50%);
`;

type ModalProps = {
	children?: ReactElement | ReactElement[];
}

const ModalWindow = ({children}: ModalProps) => (
	<Overlay>
		<Container>
			{children}
		</Container>
	</Overlay>
);

export default ModalWindow;