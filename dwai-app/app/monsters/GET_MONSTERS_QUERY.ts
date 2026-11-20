import { graphql } from "@/gql";

export const GET_MONSTERS_QUERY = graphql(`
  query GetMonsters {
    monsters {
      compendium {
        armor
        hp
        id
        name
        setting {
          key
          name
        }
        tags
      }
      mine {
        armor
        hp
        id
        name
        tags
      }
      settings {
        key
        name
      }
      tags
    }
  }
`);
