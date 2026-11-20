import { graphql } from "@/gql";

/** A monster's full stat block. */
export const MonsterFragment = graphql(`
  fragment MonsterFragment on Monster {
    armor
    attack {
      damage
      ignoresArmor
      name
      piercing
      tags
    }
    description
    hp
    id
    instinct
    moves
    name
    setting {
      key
      name
    }
    source
    sourceKey
    specialQualities
    tags
  }
`);
