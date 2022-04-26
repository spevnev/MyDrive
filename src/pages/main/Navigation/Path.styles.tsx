import styled from "styled-components";

export const PathElement = styled.div`
  display: inline;

  &::after {
    display: none;
  }
`;

export const PathContainer = styled.div`
  font-size: 24px;
  font-weight: 300;
  overflow: scroll;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }

  & a, ${PathElement} {
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
