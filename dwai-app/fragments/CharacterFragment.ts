import { graphql } from "@/gql";

export const CharacterFragment = graphql(`
  fragment CharacterFragment on Character {
    abilities {
      ability
      modifier
      score
    }
    advancedMoves {
      ...MoveFragment
    }
    alignmentDescription
    alignmentType
    armor
    availableAdvancedMoves {
      ...MoveFragment
    }
    canLevelUp
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
    level
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
    xp
    xpToLevel
  }
`);
