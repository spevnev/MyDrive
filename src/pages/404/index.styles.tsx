import styled from "styled-components";
import {Link} from "react-router-dom";

export const Page = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.p`
  font-size: 48px;
  font-weight: 100;
  letter-spacing: .1px;
  margin-bottom: 10px;
`;

export const StyledLink = styled(Link)`
  color: #000;
  transition: all .2s;

  &:hover {
    color: #393976;
  }
`;