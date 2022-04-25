import {gql} from "@apollo/client";

export const GET_FOLDERS_RECURSIVELY_QUERY = gql`
    query getFoldersRecursively{
        folders(recursively: true){
            name
            parent_id
            id
        }
    }
`;