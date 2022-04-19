import {gql} from "@apollo/client";

export const SIDEBAR_QUERY = gql`
    query sidebar{
        user{
            space_used
        }

        folders(recursively: true){
            name
            id
            parent_id
        }

        rootSharedFolders{
            name
            id
        }
    }
`;