import {gql} from "@apollo/client";

export const SIDEBAR_QUERY = gql`
    query sidebar{
        user{
            space_used
        }

        folders{
            name
            id
        }

        rootSharedFolders{
            name
            id
        }
    }
`;