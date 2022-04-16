import styled from "styled-components";

export const Container = styled.div`
  z-index: 9999;
  background: #fdfdfd;
  border-radius: 8px;
  box-shadow: 2px 4px 8px 3px rgba(0, 0, 0, .5);
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
`;

export const Option = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  width: 100%;
  transition: background-color .2s;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
  }
`;

export const Icon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 10px;

  @media (min-width: 1280px) {
    width: 26px;
    height: 26px;
  }
`;

export const Name = styled.p`
  font-size: 18px;
  text-align: center;
  width: 100%;

  @media (min-width: 1280px) {
    font-size: 22px;
  }
`;

export const BR = styled.div`
  display: block;
  height: 1px;
  width: 100%;
  background: #bbb;
`;