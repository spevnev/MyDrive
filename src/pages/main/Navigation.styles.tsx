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
`;

export const Path = styled.div`
  font-size: 24px;
  font-weight: 300;

  & a {
    text-decoration: none;
    color: #000;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: calc(100% - 2px);
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 1px;
      background: #8888fd;
      opacity: .8;
      transition: all .2s ease;
    }

    &:hover {
      &::after {
        width: 100%;
      }
    }
  }

  & span {
    margin: 0 2px;
    font-weight: 200;
  }
`;

export const Icons = styled.div`
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
  
  &.shown{
    transform: rotate(90deg);

    &:hover{
      transform: rotate(0);
    }
  }

  @media (min-width: 800px) {
    display: none;
  }
`;