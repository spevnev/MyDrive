import styled from "styled-components";

export const EntryContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  border-radius: 0 50px 50px 0;
  transition: background-color .2s;

  &:hover, &.selected{
    background: #f0f0f0;
  }

  @media (max-width: 800px) {
  	padding: 10px;
  }
`;

export const Icon = styled.img`
  width: 20px;
  height: 20px;

  @media (max-width: 800px) {
    width: 24px;
    height: 24px;
	margin-left: 5px;
  }

  @media (min-width: 1280px) {
    width: 32px;
    height: 32px;
    margin-left: 5px;
  }
`;

export const DropDownIcon = styled.img`
  width: 30px;
  height: 30px;
  margin: -5px;
  transition: transform .15s;

  @media (max-width: 800px) {
  	width: 35px;
	height: 35px;
	margin: -10px;
  }
  
  @media (min-width: 1280px) {
    width: 40px;
    height: 40px;
	margin-right: -10px;
  }
`;

export const Text = styled.p`
  font-size: 16px;
  margin: 0 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;

  @media (max-width: 800px) {
  	font-size: 18px;
  }

  @media (min-width: 1280px) {
    font-size: 20px;
  }
`;

export const DepthPadding = styled.div`
  display: block;
  opacity: 0;
  width: 10px;

  @media (max-width: 800px) {
    width: 15px;
  }

  @media (min-width: 1280px) {
    width: 20px;
  }
`;