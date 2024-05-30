import { graphql } from "../gql/gql";

export const GET_CHARACTERS_QUERY = graphql(`query GetCharacters {
    characters {
        all {
            id
            name
        }
    }
}`);