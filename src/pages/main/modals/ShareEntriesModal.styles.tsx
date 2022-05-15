import styled from "styled-components";
import {ReactComponent as CrossSvg} from "assets/cross.svg";
import StyledInput from "../../../components/StyledInput";

export const Users = styled.div`
  display: flex;
  flex-direction: column;
`;

export const UserContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 2px 0;
`;

export const Username = styled.div`
  font-size: 24px;
  font-weight: 300;
`;

export const Cross = styled(CrossSvg)`
  width: 28px;
  height: 28px;
  cursor: pointer;
  color: #000;
  transition: all .2s;
  margin: 0 10px;

  &:hover {
    color: #22a;
  }
`;

export const UserSubContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const SubContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
`;

export const Input = styled(StyledInput)`
  width: 65%;
  margin-right: 12px;
`;

export const ErrorMessage = styled.p`
  font-size: 14px;
  color: #ea2828;
`;