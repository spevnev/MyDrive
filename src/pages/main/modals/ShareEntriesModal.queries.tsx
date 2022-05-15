import {gql} from "@apollo/client";

export const GET_USER_IDS_QUERY = gql`
    query getUserIds($usernames: [String!]!){
        users(usernames: $usernames){
            username
            id
        }
    }
`;

export const DOES_USER_EXIST_QUERY = gql`
    query doesUserExist($username: String!){
        doesUserExist(username: $username)
    }
`;

export const SHARE_ENTRIES_MUTATION = gql`
    mutation shareEntries($file_id: Int!, $policies: SharePolicies!){
        shareEntries(file_id: $file_id, policies: $policies)
    }
`;
