import styled from "styled-components";

export default styled.input`
  font-size: 20px;
  outline: none;
  padding: 4px 6px;
  border-radius: 5px;
  border: 1px solid #888;
  background: #fff;
  transition: all .2s;

  &:hover {
    background: #f4f4f4;
  }

  @media(min-width: 1280px) {
    font-size: 24px;
	padding: 5px 8px;
  }

  @media(max-width: 800px) {
	font-size: 16px;
	padding: 2px 4px;
  }
`;