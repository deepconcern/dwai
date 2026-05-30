import { graphql } from "@/gql";

export const CharacterFragment = graphql(`
  fragment CharacterFragment on Character {
    abilities {
      ability
      modifier
      score
    }
    alignmentDescription
    alignmentType
    characterClass {
      damageDie
      hpBase
      key
      name
    }
    classMoves {
      ...MoveFragment
    }
    hitPoints
    id
    looks {
      id
      lookType {
        key
        name
      }
      value
    }
    name
    raceMove {
      ...MoveFragment
    }
  }
`);
