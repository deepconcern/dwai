import { useSuspenseQuery } from "@apollo/client";
import { FC } from "react";
import { Link } from "react-router";

import { Container } from "../components/Container";
import { Page } from "../components/Page";
import { GET_CHARACTER_CLASSES_QUERY } from "../queries";

export const CharacterClassesPage: FC = () => {
  const { data } = useSuspenseQuery(GET_CHARACTER_CLASSES_QUERY);

  return (
    <Page
      back="/"
      title="Character Classes"
    >
      <Container title="Classes">
        <main>
          {data.characterClass.all.length > 0 && (
            <ul>
              {data.characterClass.all.map((c) => (
                <li key={c.id}>
                  <Link to={`/character-class/${c.id}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </Container>
    </Page>
  );
};
