import { graphql } from "@/gql";

/** Everything the Prep page shows: fronts, dangers, encounters, and what the forms suggest. */
export const GET_PREP_QUERY = graphql(`
  query GetPrep($id: ID!) {
    campaigns {
      byId(id: $id) {
        dangersWithoutFront {
          ...DangerFragment
        }
        encounters {
          danger {
            id
            name
          }
          id
          location
          monsters {
            count
            id
            maxHp
            statBlock {
              armor
              name
            }
          }
          name
          notes
        }
        fronts {
          dangers {
            ...DangerFragment
          }
          id
          kind
          name
          notes
          resolved
          stakes {
            answer
            question
          }
        }
        id
        name
      }
    }
    dangerTemplate {
      categories {
        key
        name
        types {
          impulse
          key
          name
        }
      }
      impendingDooms {
        description
        key
        name
      }
    }
    monsters {
      compendium {
        hp
        id
        name
        setting {
          key
          name
        }
        tags
      }
      mine {
        hp
        id
        name
        tags
      }
    }
  }
`);
