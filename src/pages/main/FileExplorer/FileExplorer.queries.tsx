import {gql} from "@apollo/client";

export const GET_PRESIGNED_URLS_QUERY = gql`
    query getPresignedUrls($file_ids: [Int!]!){
        entriesPresignedUrls(file_ids: $file_ids) {
            file_id
            parent_id
            name
            url
            is_directory
        }
    }
`;

export const PUT_ENTRIES_IN_BIN_MUTATION = gql`
    mutation putEntriesInBin($entries: [MoveEntriesEntry!]!){
        putEntriesInBin(entries: $entries)
    }
`;

export const GET_ENTRY_QUERY = gql`
    query getEntry($id: Int!) {
        entry(id: $id) {
            name
        }
    }
`;

export const RESTORE_ENTRIES_MUTATION = gql`
    mutation restoreEntries($entry_ids: [Int!]!, $restore_to_drive: Boolean!) {
        restoreEntries(entry_ids: $entry_ids, restore_to_drive: $restore_to_drive)
    }
`;

export const FULLY_DELETE_ENTRIES_MUTATION = gql`
    mutation fullyDeleteEntries($entry_ids: [Int!]!) {
        fullyDeleteEntries(entry_ids: $entry_ids)
    }
`;