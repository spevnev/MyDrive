import {gql} from "@apollo/client";

export const UPLOAD_FILES_MUTATION = gql`
    mutation uploadFiles($entries: [SimpleFileEntryInput!]!, $parent_id: Int){
        uploadFiles(entries: $entries, parent_id: $parent_id){
            url{
                url
                fields{
                    key
                    bucket
                    Policy
                    Date
                    Algorithm
                    Signature
                    Credential
                }
            }
            path
            id
            parent_id
        }
    }
`;

export const UPLOAD_FILES_AND_FOLDERS_MUTATION = gql`
    mutation uploadFilesAndFolders($entries: [FileEntry!]!, $parent_id: Int){
        uploadFilesAndFolders(entries: $entries, parent_id: $parent_id){
            url{
                url
                fields{
                    key
                    bucket
                    Policy
                    Date
                    Algorithm
                    Signature
                    Credential
                }
            }
            path
            id
            parent_id
        }
    }
`;

export const GET_ENTRIES_QUERY = gql`
    query getEntries($parent_id: Int){
        entries(parent_id: $parent_id){
            name
            is_directory
        }
    }
`;