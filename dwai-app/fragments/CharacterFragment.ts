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
    armor
    characterClass {
      damageDie
      hpBase
      key
      name
    }
    classMoves {
      ...MoveFragment
    }
    debilities
    equipment {
      ...ItemFragment
    }
    gold
    hitPoints
    id
    isDying
    load
    looks {
      id
      lookType {
        key
        name
      }
      value
    }
    maxHitPoints
    maxLoad
    name
    raceMove {
      ...MoveFragment
    }
  }
`);
