import { notFound } from "next/navigation";
import { FC } from "react";

import { graphql } from "@/gql";
import { query } from "@/lib/apollo-client";

const GET_CHARACTER_QUERY = graphql(`
  query GetCharacter($id: ID!) {
    characters {
      byId(id: $id) {
        id
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
      <div>
        <h2>{character.name}</h2>
      </div>
    </>
  );
};

export default CharacterPage;
