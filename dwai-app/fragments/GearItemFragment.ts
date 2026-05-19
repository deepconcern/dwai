import { graphql } from "@/gql";

export const GearItemFragment = graphql(`
  fragment GearItemFragment on GearItem {
    count
    description
    key
    label
    tags {
      key
      name
      quantity
    }
  }
`);
