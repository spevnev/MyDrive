import styled from "styled-components";

const Container = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  background: #f3f3f3;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Text = styled.p`
  font-size: 36px;
  font-weight: 200;
  text-align: center;
`;

type DropZoneProps = {
	onDrop: (arg: any) => void;
}

const DropZone = ({onDrop}: DropZoneProps) => (
	<Container onDrop={onDrop}>
		<Text>Drop files and folders here to upload!</Text>
	</Container>
);

export default DropZone;