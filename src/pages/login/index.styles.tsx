import styled from "styled-components";

export const Page = styled.main`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: auto 0;
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: auto 0;
  height: 60vh;
  width: 65vw;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 2px 4px 8px rgba(0, 0, 0, .4);

  @media (max-width: 800px) {
    height: 70vh;
  }
`;

export const Logo = styled.img`
  width: 60px;
  height: 60px;

  @media (min-width: 1600px) {
    width: 80px;
    height: 80px;
  }

  @media (max-width: 800px) {
    width: 45px;
    height: 45px;
  }
`;

export const Title = styled.p`
  font-size: 48px;
  font-weight: 100;
  margin-left: 25px;

  @media (min-width: 1600px) {
    font-size: 56px;
  }

  @media (max-width: 800px) {
    font-size: 36px;
    margin-left: 15px;
  }
`;