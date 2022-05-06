import {gql} from "@apollo/client";

export const SIDEBAR_QUERY = gql`
    query sidebar{
        rootSharedFolders{
            name
            id
        }
    }
`;