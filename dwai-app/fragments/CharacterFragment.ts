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
    expectedSpellbookSize
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
    maxPreparedSpellLevels
    name
    preparedSpellLevels
    preparedSpells {
      isForgotten
      spell {
        ...SpellFragment
      }
    }
    raceMove {
      ...MoveFragment
    }
    spellbook {
      ...SpellFragment
    }
    xp
    xpToLevel
  }
`);
