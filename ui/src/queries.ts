import { graphql } from "./gql";

export const FULL_CHARACTER = graphql(`
  fragment FullCharacter on Character {
    alignment {
      id
      name
      text
    }
    armor
    attributes {
      modifier
      type
      score
    }
    bonds {
      id
      target {
        ...ShortCharacter
      }
      text
    }
    bondScores {
      id
      score
      target {
        ...ShortCharacter
      }
    }
    characterClass {
      damageDie
      id
      name
    }
    classMoves {
      ... on CharacterMove {
        ...FullCharacterMove
      }
    }
    coin
    currentHp
    id
    inventoryItems {
      ...FullInventoryItem
    }
    level
    looks {
      id
      lookTarget {
        id
        name
      }
      text
    }
    maxHp
    maxWeight
    name
    partyMembers {
      ...ShortCharacter
    }
    raceMove {
      ... on CharacterMove {
        ...FullCharacterMove
      }
    }
    weight
    xp
  }
`);

export const FULL_CHARACTER_CLASS = graphql(`
  fragment FullCharacterClass on CharacterClass {
    alignmentTemplates {
      id
      name
      text
    }
    damageDie
    defaultStartingMoves {
      ...ShortMoveTemplate
    }
    hpBase
    id
    name
    pickableStartingMoves {
      ...ShortMoveTemplate
    }
    raceMoves {
      ...ShortMoveTemplate
    }
    weightBase
  }
`);

export const FULL_CHARACTER_MOVE = graphql(`
  fragment FullCharacterMove on CharacterMove {
    diceOverrides {
      id
      name
      value
    }
    id
    forwards {
      id
      name
      value
    }
    moveOptions {
      id
      value
    }
    name
    ongoings {
      id
      name
      value
    }
    roll
    text
  }
`);

export const FULL_INVENTORY_ITEM = graphql(`
  fragment FullInventoryItem on InventoryItem {
    ammo
    armor
    cost
    extraArmor
    id
    isDisabled
    isWorn
    location
    name
    tags
    type
    weight
  }
`);

export const FULL_MOVE_TEMPLATE = graphql(`
  fragment FullMoveTemplate on MoveTemplate {
    diceOverrides {
      id
      name
      value
    }
    id
    forwards {
      id
      name
      value
    }
    moveOptions {
      id
      value
    }
    name
    ongoings {
      id
      name
      value
    }
    roll
    text
  }
`);

export const GET_CHARACTER_CLASSES_QUERY = graphql(`
  query GetCharacterClasses {
    characterClass {
      all {
        ...FullCharacterClass
      }
    }
  }
`);

export const GET_CHARACTER_QUERY = graphql(`
  query GetCharacter($id: ID!) {
    character {
      byId(id: $id) {
        ...FullCharacter
      }
    }
  }
`);

export const SHORT_CHARACTER = graphql(`
  fragment ShortCharacter on Character {
    id
    name
  }
`);

export const SHORT_MOVE_TEMPLATE = graphql(`
  fragment ShortMoveTemplate on MoveTemplate {
    id
    isPickable
    name
    text
  }
`);
