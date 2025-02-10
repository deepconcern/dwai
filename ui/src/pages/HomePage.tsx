import { useSuspenseQuery } from "@apollo/client";
import { FC } from "react";
import { Link } from "react-router";

import { ButtonLink } from "../components/ButtonLink";
import { Container } from "../components/Container";
import { Page } from "../components/Page";
import { graphql } from "../gql";

const HOME_PAGE_QUERY = graphql(`
  query HomePage {
    character {
      all {
        characterClass {
          id
          name
        }
        id
        name
      }
    }
  }
`);

export const HomePage: FC = () => {
  const { data } = useSuspenseQuery(HOME_PAGE_QUERY);

  return (
    <Page
      css={(theme) => ({
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing[4],
      })}
      title="Home"
    >
      <Container title="Characters">
        <main>
          {data.character.all.length === 0 && (
            <p>
              <strong>NO CHARACTERS AVAILABLE</strong>
            </p>
          )}
          {data.character.all.length > 0 && (
            <ul>
              {data.character.all.map((c) => (
                <li key={c.id}>
                  <Link to={`/character/${c.id}`}>
                    {c.name} ({c.characterClass.name})
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <ButtonLink to="/create-character" variant="primary">
            Create Character
          </ButtonLink>
        </main>
      </Container>
    </Page>
  );
};
