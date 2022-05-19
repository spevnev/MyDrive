import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #aaa;
  padding: 8px 25px 5px 5px;
  margin-left: 5px;

  @media (max-width: 800px) {
    margin-left: 0;
    padding: 8px 20px 5px 20px;
  }
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 90%;
`;

export const Icons = styled.div`
  min-width: fit-content;

  & svg {
    margin-left: 12px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    transition: all .2s;

    &:hover {
      fill: #8888fd;
    }
  }
`;

export const SidebarMenu = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-right: 20px;
  transition: all .3s;

  &:hover {
    transform: rotate(90deg);
  }

  &.shown {
    transform: rotate(90deg);

    &:hover {
      transform: rotate(0);
    }
  }

  @media (min-width: 801px) {
    display: none;
  }
`;