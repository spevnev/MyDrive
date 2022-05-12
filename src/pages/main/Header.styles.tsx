import styled from "styled-components";
import {ReactComponent as LogoSvg} from "assets/logo.svg";

export const Container = styled.div`
  width: 100%;
  height: 7%;
  border-bottom: 1px solid #aaa;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;

  @media (max-width: 500px) {
    padding: 0 20px;
  }
`;

export const Logo = styled(LogoSvg)`
  width: 40px;
  height: 40px;

  @media (max-width: 500px) {
    width: 30px;
    height: 30px;
  }
`;

export const Title = styled.p`
  font-size: 32px;
  font-weight: 200;
  margin-left: 15px;

  @media (max-width: 500px) {
    margin-left: 8px;
    font-size: 28px;
  }
`;

export const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
`;

export const Username = styled.p`
  font-size: 24px;
  letter-spacing: -.5px;
  font-weight: 300;

  @media (max-width: 500px) {
    font-size: 20px;
  }
`;