import { graphql } from "@/gql";

export const ItemFragment = graphql(`
  fragment ItemFragment on Item {
    count
    description
    id
    isWorn
    key
    label
    tags {
      key
      name
      quantity
    }
    type
  }
`);
