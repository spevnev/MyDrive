import styled from "styled-components";

export default styled.button`
  padding: 4px 8px;
  border-radius: 5px;
  border: 1px solid #888;
  font-size: 20px;
  cursor: pointer;
  background: #fbfbfb;
  box-shadow: 0 2px 5px rgba(0, 0, 0, .2);
  transition: all .2s;

  &:hover {
    transform: translateY(2px);
    box-shadow: 0 2px 3px rgba(0, 0, 0, .4);
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, .8);
  }

  @media (min-width: 1600px) {
    font-size: 24px;
    padding: 5px 10px;
  }

  @media (max-width: 800px) {
    font-size: 16px;
    padding: 3px 5px;
  }
`;