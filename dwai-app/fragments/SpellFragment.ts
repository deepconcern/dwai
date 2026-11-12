import { graphql } from "@/gql";

export const SpellFragment = graphql(`
  fragment SpellFragment on Spell {
    description
    key
    level
    name
    options
    tags
  }
`);
