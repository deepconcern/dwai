import { notFound } from "next/navigation";
import { FC } from "react";

import { PageTitle } from "@/components/PageTitle";
import { SectionTitle } from "@/components/SectionTitle";
import { graphql } from "@/gql";
import { query } from "@/lib/apollo-client";

const GET_CHARACTER_QUERY = graphql(`
  query GetCharacter($id: ID!) {
    characters {
      byId(id: $id) {
        abilities {
          ability
          modifier
          score
        }
        id
        looks {
          id
          lookType {
            key
            name
          }
          value
        }
        name
      }
    }
  }
`);

export const CharacterPage: FC<{
  params: Promise<{ characterId: string }>;
}> = async ({ params }) => {
  const { characterId } = await params;

  const { data } = await query({
    query: GET_CHARACTER_QUERY,
    variables: { id: characterId },
  });

  if (!data) notFound();

  const character = data.characters.byId;

  return (
    <>
      <PageTitle title={character.name} />

      {/* Abilities */}
      <section>
        <SectionTitle title="Abilities" />
        <div className="flex justify-around space-x-4">
          {character.abilities.map(({ ability, modifier, score }) => (
            <div
              className="border flex flex-col items-center justify-center p-2 rounded"
              key={ability}
            >
              <h4>{ability}</h4>
              <strong className="text-2xl">
                {modifier < 0 ? "-" : "+"}
                {Math.abs(modifier)}
              </strong>
              <p>Score: {score}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default CharacterPage;
