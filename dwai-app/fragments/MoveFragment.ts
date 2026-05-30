import { graphql } from "@/gql";

export const MoveFragment = graphql(`
  fragment MoveFragment on Move {
    creationOptions {
      choices {
        isPicked
        key
        label
      }
      label
      pick
    }
    description
    key
    name
    on10
    on7to9
    onMiss
    options
    replacesKey
    requiresKey
    roll
    trigger
    type
  }
`);
