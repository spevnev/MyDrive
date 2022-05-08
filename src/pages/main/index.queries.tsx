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

export const CURRENT_FOLDER_QUERY = gql`
    query currentFolder($parent_id: Int!){
        entries(parent_id: $parent_id){
            name
            is_directory
            id
            parent_id
        }
    }
`;