import {gql} from "@apollo/client";

export const MAIN_QUERY = gql`
    query main{
        folders(recursively: true){
            name
            parent_id
            id
        }

        user{
            space_used
        }
    }
`;