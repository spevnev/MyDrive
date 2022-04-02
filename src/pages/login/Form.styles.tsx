import styled from "styled-components";
import StyledInput from "../../components/StyledInput";
import StyledButton from "../../components/StyledButton";

type ContainerProps = {
	background: string;
	color: string;
}

export const Container = styled.div<ContainerProps>`
  background: ${props => props.background};
  color: ${props => props.color};
  height: 100%;
  width: 100%;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

export const FormInputs = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
`;

export const FormTitle = styled.p`
  font-size: 32px;
  font-weight: 300;
`;

export const ErrorMessage = styled.p`
  font-size: 12px;
  text-align: center;
  color: #ff0000;
`;

export const Input = styled(StyledInput)`
  width: 90%;
  margin: 5px 0;
`;

export const Button = styled(StyledButton)`
  margin: 20px 0 10px 0;
`;