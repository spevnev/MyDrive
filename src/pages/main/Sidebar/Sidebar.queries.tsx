import {gql} from "@apollo/client";

export const SIDEBAR_QUERY = gql`
    query sidebar{
        sharedFolders(include_owners: true){
            name
            id
            parent_id
            share_id
            username
        }
    }
`;