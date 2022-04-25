import styled from "styled-components";

export const Hidden = styled.div`
  display: none;
`;

export const Container = styled.div`
  width: 400px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const Header = styled.p`
  font-size: 24px;
  font-weight: 200;
  width: 100%;
`;

export const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: fit-content;
  align-items: center;
  justify-content: flex-end;
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