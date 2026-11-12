"use client";
"use client";

import { useSuspenseQuery } from "@apollo/client/react";
import { notFound } from "next/navigation";
import { FC } from "react";

import { PageTitle } from "@/components/PageTitle";
import { CharacterFragment } from "@/fragments/CharacterFragment";
import { MoveFragment } from "@/fragments/MoveFragment";
import { unmaskFragment } from "@/gql";

import { AbilitiesSection } from "./AbilitiesSection";
import { CharacterTabs } from "./CharacterTabs";
import { GET_CHARACTER_QUERY } from "./GET_CHARACTER_QUERY";

export type CharacterPageClientProps = {
  characterId: string;
};

export const CharacterPageClient: FC<CharacterPageClientProps> = ({
  characterId,
}) => {
  const { data } = useSuspenseQuery(GET_CHARACTER_QUERY, {
    variables: { id: characterId },
  });

  if (!data) notFound();

  const character = unmaskFragment(CharacterFragment, data.characters.byId);
  const raceMove = unmaskFragment(MoveFragment, character.raceMove);
  return (
    <>
      <PageTitle title={character.name} />
      <p className="mb-4">
        Level {character.level} {raceMove.name} {character.characterClass.name}
      </p>

      <div className="flex flex-col space-y-4">
        <AbilitiesSection character={character} />

        <CharacterTabs
          basicMoves={data.moves.basicMoves}
          character={character}
          specialMoves={data.moves.specialMoves}
        />
      </div>
    </>
  );
};
