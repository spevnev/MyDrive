import {gql} from "@apollo/client";

export const LOGIN_MUTATION = gql`
    mutation login($username: String!, $password: String!){
        login(username: $username, password: $password){
            token
            error
        }
    }
`;

export const SIGNUP_MUTATION = gql`
    mutation signup($username: String!, $password: String!){
        signup(username: $username, password: $password){
            token
            error
        }
    }
`;