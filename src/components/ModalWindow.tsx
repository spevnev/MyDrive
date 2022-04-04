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
  min-width: 25%;
  min-height: 20%;
  transform: translate(-50%, -50%);
`;

type ModalProps = {
	isOpened: boolean;
	children: ReactElement | ReactElement[];
}

const ModalWindow = ({isOpened, children}: ModalProps) => {
	if (!isOpened) return null;
	return (
		<Overlay>
			<Container>
				{children}
			</Container>
		</Overlay>
	);
};

export default ModalWindow;