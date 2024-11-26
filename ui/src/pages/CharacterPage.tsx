import { useSuspenseQuery } from "@apollo/client";
import { FC } from "react";
import { useParams } from "react-router";

import { Page } from "../components/Page";
import { graphql } from "../gql";

const GET_CHARACTER_QUERY = graphql(`
  query GetCharacter($id: ID!) {
    character {
      byId(id: $id) {
        id
        name
      }
    }
  }
`);

export const CharacterPage: FC = () => {
  const { id } = useParams<{id: string}>();
  const { data } = useSuspenseQuery(GET_CHARACTER_QUERY, {
    variables: { id: id! },
  });

  return (
    <Page title={data.character.byId.name}>
      <p>TODO</p>
    </Page>
  );
};
