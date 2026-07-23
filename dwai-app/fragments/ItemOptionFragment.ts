import { graphql } from "@/gql";

export const ItemOptionFragment = graphql(`
  fragment ItemOptionFragment on ItemOption {
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
