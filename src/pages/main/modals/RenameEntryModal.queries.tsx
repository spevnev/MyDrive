import {gql} from "@apollo/client";

export const RENAME_ENTRY_MUTATION = gql`
    mutation renameEntry($newFilename: String!, $file_id: Int!){
        rename(newFilename: $newFilename, file_id: $file_id)
    }
`;