import styled from "styled-components";
import StyledInput from "components/StyledInput";
import StyledButton from "components/StyledButton";

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

export const Title = styled.p`
  font-size: 32px;
  font-weight: 300;

  @media (min-width: 1600px) {
    font-size: 36px;
  }

  @media (max-width: 800px) {
    font-size: 24px;
  }
`;

export const ErrorMessage = styled.p`
  font-size: 12px;
  text-align: center;
  color: #ff0000;

  @media (min-width: 1600px) {
    font-size: 14px;
  }

  @media (max-width: 800px) {
    font-size: 10px;
  }
`;

export const Input = styled(StyledInput)`
  width: 90%;
  margin: 5px 0;

  @media (max-width: 800px) {
    width: 95%;
    margin: 2px 0;
  }
`;

export const Button = styled(StyledButton)`
  margin: 20px 0 10px 0;

  @media (max-width: 800px) {
    margin: 8px 0 4px 0;
  }
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SubTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 18px;
  margin-top: 5px;

  @media (min-width: 1600px) {
    font-size: 24px;
  }

  @media (max-width: 800px) {
    font-size: 14px;
  }
`;