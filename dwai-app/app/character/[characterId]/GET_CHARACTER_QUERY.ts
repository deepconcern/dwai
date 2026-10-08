import { graphql } from "@/gql";

export const GET_CHARACTER_QUERY = graphql(`
  query GetCharacter($id: ID!) {
    characters {
      byId(id: $id) {
        ...CharacterFragment
      }
    }
    moves {
      basicMoves: byType(type: "basic") {
        ...MoveFragment
      }
      specialMoves: byType(type: "special") {
        ...MoveFragment
      }
    }
  }
`);
