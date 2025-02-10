import { useSuspenseQuery } from "@apollo/client";
import { FC } from "react";
import { useParams } from "react-router";

import { Page } from "../components/Page";
import { graphql } from "../gql";
import { Container } from "../components/Container";

const GET_CHARACTER_CLASS_QUERY = graphql(`
  query GetCharacterClass($id: ID!) {
    characterClass {
      byId(id: $id) {
        damageDie
        hpBase
        id
        name
      }
    }
  }
`);

export const CharacterClassPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useSuspenseQuery(GET_CHARACTER_CLASS_QUERY, {
    variables: { id: id! },
  });

  const characterClass = data.characterClass.byId;

  return (
    <Page back="/character-classes" title={characterClass.name}>
      <Container title="Basic Info">
        <div
          css={(theme) => ({
            display: "flex",
            gap: theme.spacing[2],
            justifyContent: "space-evenly",
          })}
        >
          <div>HP: {characterClass.hpBase} + Constitution</div>
          <div>Damage Die: d{characterClass.damageDie}</div>
        </div>
      </Container>
    </Page>
  );
};
