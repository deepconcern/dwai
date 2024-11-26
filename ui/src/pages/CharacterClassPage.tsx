import { useSuspenseQuery } from "@apollo/client";
import { FC } from "react";
import { useParams } from "react-router";

import { Page } from "../components/Page";
import { graphql } from "../gql";

const GET_CHARACTER_CLASS_QUERY = graphql(`
  query GetCharacterClass($id: ID!) {
    characterClass {
      byId(id: $id) {
        id
        name
      }
    }
  }
`);

export const CharacterClassPage: FC = () => {
  const { id } = useParams<{id: string}>();
  const { data } = useSuspenseQuery(GET_CHARACTER_CLASS_QUERY, {
    variables: { id: id! },
  });

  return (
    <Page title={data.characterClass.byId.name}>
      <p>TODO</p>
    </Page>
  );
};
