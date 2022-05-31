import {gql} from "@apollo/client";

export const MAIN_QUERY = gql`
    query main{
        sharedFolders(include_owners: true){
            name
            id
            parent_id
            share_id
            username
        }

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
        entries(parent_id: $parent_id, include_previews: true){
            name
            is_directory
            id
            parent_id
            preview
            can_edit
            bin_data {
                put_at
                prev_parent_id
            }
        }
    }
`;

export const CAN_EDIT_CURRENT_FOLDER_QUERY = gql`
    query canEditCurrentFolder($id: Int!){
        entry(id: $id) {
            can_edit
        }
    }
`;

export const USERNAMES_WHO_SHARE_WITH_ME_QUERY = gql`
    query usernames{
        usernamesWhoShareWithMe
    }
`;

export const USERS_SHARED_ENTRIES_QUERY = gql`
    query usersSharedEntries($username: String!) {
        usersSharedEntries(username: $username){
            name
            parent_id
            id
            is_directory
            can_edit
        }
    }
`;

export const GET_ENTRY_SHARE_ID_QUERY = gql`
    query getEntry($id: Int!){
        entry(id: $id){
            share_id
        }
    }
`;