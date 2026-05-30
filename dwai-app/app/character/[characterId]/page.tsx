import { notFound } from "next/navigation";
import { FC } from "react";

import { PageTitle } from "@/components/PageTitle";
import { SectionTitle } from "@/components/SectionTitle";
import { CharacterFragment } from "@/fragments/CharacterFragment";
import { MoveFragment } from "@/fragments/MoveFragment";
import { graphql, useFragment } from "@/gql";
import { query } from "@/lib/apollo-client";

import { CharacterTabs } from "./CharacterTabs";

const GET_CHARACTER_QUERY = graphql(`
  query GetCharacter($id: ID!) {
    characters {
      byId(id: $id) {
        ...CharacterFragment
      }
    }
    moves {
      basicMoves: byType(type: "basic") {
        ...MoveFragment
      }
      specialMoves: byType(type: "special") {
        ...MoveFragment
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

  const character = useFragment(CharacterFragment, data.characters.byId);
  const raceMove = useFragment(MoveFragment, character.raceMove);
  return (
    <>
      <PageTitle title={character.name} />
      <p className="mb-4">
        Level ?? {raceMove.name} {character.characterClass.name}
      </p>

      <div className="flex flex-col space-y-4">
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

        <CharacterTabs
          basicMoves={data.moves.basicMoves}
          character={character}
          specialMoves={data.moves.specialMoves}
        />
      </div>
    </>
  );
};

export default CharacterPage;
