import { graphql } from "@/gql";

/** A danger with its grim portents, as the GM sees it. */
export const DangerFragment = graphql(`
  fragment DangerFragment on Danger {
    category {
      key
      moves
      name
    }
    frontId
    id
    impendingDoom
    impulse
    name
    notes
    portents {
      done
      id
      revealed
      text
    }
    revealed
    type
  }
`);
