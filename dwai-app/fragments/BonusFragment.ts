import { graphql } from "@/gql";

/** A +forward or +ongoing bonus on a character's sheet. */
export const BonusFragment = graphql(`
  fragment BonusFragment on Bonus {
    amount
    id
    kind
    label
  }
`);
