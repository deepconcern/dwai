import { graphql } from "@/gql";

/**
 * What the bonds section and the End of Session report need of a
 * character: its alignment, bonds, campaign party, and any session waiting
 * for its report.
 */
export const CampaignCharacterFragment = graphql(`
  fragment CampaignCharacterFragment on Character {
    alignmentDescription
    alignmentType
    bonds {
      id
      target {
        id
        name
      }
      text
    }
    campaign {
      characters {
        id
        name
      }
      id
      isGm
      name
    }
    characterClass {
      bonds
      key
    }
    id
    name
    pendingSession {
      id
      learned {
        checked
      }
      looted {
        checked
      }
      number
      overcame {
        checked
      }
    }
    viewerIsOwner
    xp
  }
`);
