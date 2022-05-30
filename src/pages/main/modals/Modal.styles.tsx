import styled from "styled-components";

type ContainerProps = {
	height?: number;
}

export const Container = styled.div<ContainerProps>`
  min-width: 400px;
  min-height: ${props => props.height || 150}px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const Header = styled.p`
  font-size: 24px;
  font-weight: 200;
  margin-bottom: 8px;

  @media (min-width: 800px) {
    white-space: nowrap;
  }
`;

export const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: fit-content;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;
`;

export const Button = styled.button`
  background: #e8e8e8;
  font-size: 18px;
  font-weight: 300;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 3px 5px;
  cursor: pointer;
  transition: all .2s;

  &:hover {
    background: #ddd;
  }
`;

export const PrimaryButton = styled.button`
  background: #4444fe;
  color: #fff;
  font-size: 18px;
  font-weight: 300;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 3px 5px;
  margin: 0 10px;
  cursor: pointer;
  transition: all .2s;

  &:hover {
    background: #3333ff;
  }
`;

export const DisabledButton = styled.button`
  background: #d8d8d8;
  font-size: 18px;
  font-weight: 300;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 3px 5px;
  margin: 0 10px;
  cursor: not-allowed;
`;