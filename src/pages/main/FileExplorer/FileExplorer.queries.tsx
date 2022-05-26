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