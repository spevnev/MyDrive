import styled from "styled-components";

export const Main = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-left: 10px;

  @media (max-width: 800px) {
    margin-left: 0;
  }
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 5px;
  overflow-y: scroll;
  height: 100%;

  &::-webkit-scrollbar {
    display: none;
  }
`;