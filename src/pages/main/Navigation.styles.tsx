import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #aaa;
  padding: 8px 10px 5px 5px;
  margin-left: 5px;
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
  & svg{
    margin-left: 12px;
    width: 24px;
    height: 24px;
    cursor: pointer;
	transition: all .2s;
	
	&:hover{
	  fill: #8888fd;
	}
  }
`;