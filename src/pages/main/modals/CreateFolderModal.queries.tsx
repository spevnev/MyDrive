import {gql} from "@apollo/client";

export const CREATE_FOLDER_MUTATION = gql`
    mutation createFolder($name: String!, $parent_id: Int){
        createFolder(name: $name, parent_id: $parent_id)
    }
`;