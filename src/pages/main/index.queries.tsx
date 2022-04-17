import {gql} from "@apollo/client";

export const UPLOAD_FILES_MUTATION = gql`
    mutation uploadFiles($entries: [SimpleFileEntry!]!, $parent_id: Int){
        uploadFiles(entries: $entries, parent_id: $parent_id)
    }
`;

export const UPLOAD_FILES_AND_FOLDERS_MUTATION = gql`
    mutation uploadFilesAndFolders($entries: [FileEntry!]!, $parent_id: Int){
        uploadFilesAndFolders(entries: $entries, parent_id: $parent_id)
    }
`;