import { graphql } from "@/gql";

export const GET_CAMPAIGN_QUERY = graphql(`
  query GetCampaign($id: ID!) {
    campaigns {
      byId(id: $id) {
        characters {
          alignmentType
          characterClass {
            name
          }
          hitPoints
          id
          looks {
            id
            value
          }
          maxHitPoints
          name
          owner {
            displayName
          }
          raceMove {
            name
          }
        }
        description
        gm {
          displayName
        }
        id
        inviteCode
        isGm
        myCharacter {
          id
          ...CampaignCharacterFragment
        }
        name
        sessions {
          createdAt
          id
          learned {
            checked
            reason
          }
          looted {
            checked
            reason
          }
          number
          overcame {
            checked
            reason
          }
          reports {
            alignment {
              checked
              reason
            }
            bond {
              checked
              reason
            }
            character {
              id
              name
            }
            resolvedBondText
            xpAwarded
          }
        }
      }
    }
  }
`);
