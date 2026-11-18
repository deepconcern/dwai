import { graphql } from "@/gql";

/** A table chat message, as the chat panel shows it. */
export const MessageFragment = graphql(`
  fragment MessageFragment on Message {
    authorIsGm
    authorName
    body
    characterId
    characterName
    createdAt
    gmOnly
    id
    kind
    ooc
    roll {
      band
      dice {
        dropped
        sides
        value
      }
      diceTotal
      label
      modifiers {
        label
        value
      }
      move {
        key
        name
        on10
        on7to9
        onMiss
      }
      source
      total
    }
    viewerIsAuthor
    whisperTo
  }
`);
