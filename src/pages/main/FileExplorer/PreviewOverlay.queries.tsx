import {gql} from "@apollo/client";

export const GET_IMAGE_PRESIGNED_URL = gql`
    query getImagePresignedUrl($file_id: Int!){
        entryPresignedUrl(file_id: $file_id)
    }
`;