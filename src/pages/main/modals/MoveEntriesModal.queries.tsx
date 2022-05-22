import {gql} from "@apollo/client";

export const MOVE_ENTRIES_MUTATION = gql`
    mutation moveEntries($entries: [MoveEntriesEntry!]!, $parent_id: Int!){
        moveEntries(entries: $entries, parent_id: $parent_id)
    }
`;