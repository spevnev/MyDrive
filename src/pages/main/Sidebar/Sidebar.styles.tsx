import styled from "styled-components";
import {ReactComponent as CrossIcon} from "assets/cross.svg";

export const Overlay = styled.div`
  @media (max-width: 800px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background: rgba(0, 0, 0, .5);

    &.hidden {
      display: none;
    }
  }
`;

export const Container = styled.div`
  width: 20%;
  min-width: 280px;
  height: 100%;

  @media (max-width: 800px) {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    background: #fdfdfd;
  }
`;

export const Button = styled.button`
  border-radius: 100px;
  border: 1px solid #aaa;
  background: #fdfdfd;
  padding: 5px 3px;
  width: 70%;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  margin: 8px;
  transition: all .2s;

  &:hover {
    background: #f2f2f2;
  }
`;

export const Icon = styled.img`
  width: 24px;
  height: 24px;
  margin: 0 12px;

  @media (max-width: 800px), (min-width: 1600px) {
    width: 32px;
    height: 32px;
  }
`;

export const Text = styled.p`
  font-size: 20px;
  font-weight: 300;

  @media (max-width: 800px), (min-width: 1600px) {
    font-size: 24px;
  }
`;

export const Explorer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 60vh;
  overflow-y: scroll;
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
  margin-top: 4px;

  @media (max-width: 800px) {
    font-size: 18px;
    margin-top: 8px;
  }

  @media (min-width: 1600px) {
    margin-top: 6px;
    font-size: 16px;
  }
`;

export const Cross = styled(CrossIcon)`
  width: 30px;
  height: 30px;
  position: absolute;
  top: 15px;
  right: 15px;
  color: #fff;
  cursor: pointer;
  transition: color .2s;

  &:hover {
    color: #b8b8b8;
  }

  @media (min-width: 800px) {
    display: none;
  }
`;