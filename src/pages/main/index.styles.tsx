import styled from "styled-components";

export const Page = styled.main`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
`;

export const Row = styled.div`
  width: 100%;
  height: 93%;
  display: flex;
  flex-direction: row;
`;

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
`;

export const Hidden = styled.div`
  display: none;
`;