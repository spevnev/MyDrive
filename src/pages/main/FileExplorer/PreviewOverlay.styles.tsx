import styled from "styled-components";
import {ReactComponent as CrossIcon} from "assets/cross.svg";

export const Overlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, .5);
  z-index: 9999;
`;

export const Cross = styled(CrossIcon)`
  width: 40px;
  height: 40px;
  position: absolute;
  top: 3vh;
  right: 3vh;
  color: #000;
  transition: all .2s;
  cursor: pointer;

  &:hover {
    color: #2727af;
  }
`;

export const Image = styled.img`
  max-width: 90vw;
  max-height: 80vh;
`;