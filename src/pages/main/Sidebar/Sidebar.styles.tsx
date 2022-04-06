import styled from "styled-components";

export const Container = styled.div`
  width: 20%;
  min-width: 250px;
  height: 100%;
`;

export const Button = styled.button`
  border-radius: 100px;
  border: 1px solid #aaa;
  background: #fdfdfd;
  padding: 6px 4px;
  width: 80%;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  margin: 10px;
  transition: all .2s;

  &:hover {
    background: #f2f2f2;
  }
`;

export const Icon = styled.img`
  width: 24px;
  height: 24px;
  margin: 0 12px;
`;

export const Text = styled.p`
  font-size: 20px;
  font-weight: 300;
`;

export const Explorer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const Storage = styled.div`
  border-top: 1px solid #aaa;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 10px;
  margin-top: 8px;
`;

export const ProgressText = styled.p`
  font-size: 14px;
  font-weight: 300;
  width: 100%;
  text-align: center;
  margin-top: 2px;
`;