import styled from "styled-components";

export const EntryContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  border-radius: 0 50px 50px 0;
  transition: all .2s;

  &:hover, &.selected{
    background: #f0f0f0;
  }
`;

export const Icon = styled.img`
  width: 24px;
  height: 24px;
`;

export const Text = styled.p`
  font-size: 20px;
  margin: 0 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
`;

export const DepthPadding = styled.div`
  display: block;
  opacity: 0;
  width: 10px;
`;