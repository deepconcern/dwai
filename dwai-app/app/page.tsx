import Link from "next/link";

import { ButtonLink } from "@/components/ButtonLink";
import { List } from "@/components/List";
import { PageTitle } from "@/components/PageTitle";
import { graphql } from "@/gql";
import { query } from "@/lib/apollo-client";

const GET_CHARACTERS_QUERY = graphql(`
  query GetCharacters {
    characters {
      all {
        id
        name
      }
    }
  }
`);

export const Home = async () => {
  const { data } = await query({
    query: GET_CHARACTERS_QUERY,
  });

  return (
    <div className="p-4">
      <PageTitle title="Home" />

      <div className="flex gap-4">
        {/* Character List */}
        <div className="flex flex-1 flex-col gap-2">
          <h3 className="font-semibold text-lg">Characters</h3>
          {data && data.characters.all.length > 0 && (
            <List
              items={data.characters.all.map((character) => ({
                content: (
                  <Link
                    href={`/character/${character.id}`}
                    className="hover:underline"
                  >
                    {character.name}
                  </Link>
                ),
                key: character.id,
              }))}
            />
          )}
          {!data || data.characters.all.length === 0 ? (
            <p>No characters found.</p>
          ) : null}
          <p>
            <ButtonLink href="/create-character">Create Character</ButtonLink>
          </p>
        </div>

        {/* Placeholder for future content */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">Other Content</h3>
          <p>This area can be used for additional features or information.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
