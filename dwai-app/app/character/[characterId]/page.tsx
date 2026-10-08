import { FC, Suspense } from "react";

import { PreloadQuery } from "@/lib/apollo-client";

import { CharacterPageClient } from "./CharacterPageClient";
import { GET_CHARACTER_QUERY } from "./GET_CHARACTER_QUERY";

export const CharacterPage: FC<{
  params: Promise<{ characterId: string }>;
}> = async ({ params }) => {
  const { characterId } = await params;

  return (
    <PreloadQuery query={GET_CHARACTER_QUERY} variables={{ id: characterId }}>
      <Suspense fallback={<>Loading...</>}>
        <CharacterPageClient characterId={characterId} />
      </Suspense>
    </PreloadQuery>
  );
};

export default CharacterPage;
