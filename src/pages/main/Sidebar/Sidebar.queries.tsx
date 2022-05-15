import {gql} from "@apollo/client";

export const SIDEBAR_QUERY = gql`
    query sidebar{
        sharedFolders{
            name
            id
            parent_id
            share_id
        }
    }
`;