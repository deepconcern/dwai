"use client";

import { useSuspenseQuery } from "@apollo/client/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, useState } from "react";

import { Button } from "@/components/Button";
import { PageTitle } from "@/components/PageTitle";
import { RollPanel } from "@/components/RollPanel";
import { SessionReportDialog } from "@/components/SessionReportDialog";
import { CampaignCharacterFragment } from "@/fragments/CampaignCharacterFragment";
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
  const [isReportOpen, setReportOpen] = useState(false);
  const { data } = useSuspenseQuery(GET_CHARACTER_QUERY, {
    variables: { id: characterId },
  });

  if (!data) notFound();

  const character = unmaskFragment(CharacterFragment, data.characters.byId);
  const pendingSession = unmaskFragment(
    CampaignCharacterFragment,
    character,
  ).pendingSession;
  const raceMove = unmaskFragment(MoveFragment, character.raceMove);
  return (
    <>
      <PageTitle title={character.name} />
      <p className="mb-4">
        Level {character.level} {raceMove.name} {character.characterClass.name}
        {character.campaign && (
          <>
            {" "}
            in{" "}
            <Link
              className="hover:underline"
              href={`/campaigns/${character.campaign.id}`}
            >
              {character.campaign.name}
            </Link>
          </>
        )}
      </p>

      {!character.viewerIsOwner && (
        <p className="border mb-4 p-2 rounded" role="note">
          You&apos;re viewing this sheet as the GM. It&apos;s read-only, except
          for HP and XP.
        </p>
      )}

      {character.viewerIsOwner && pendingSession && (
        <div
          className="border border-yellow-400 flex gap-4 items-center mb-4 p-2 rounded"
          role="status"
        >
          <p className="flex-1">
            End of Session {pendingSession.number} is waiting for your report.
          </p>
          <Button onClick={() => setReportOpen(true)}>Report</Button>
          <SessionReportDialog
            character={character}
            isOpen={isReportOpen}
            onClose={() => setReportOpen(false)}
          />
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <AbilitiesSection character={character} />

        {character.viewerIsOwner && character.campaign && (
          <RollPanel
            basicMoves={data.moves.basicMoves}
            campaignId={character.campaign.id}
            character={character}
            specialMoves={data.moves.specialMoves}
          />
        )}

        <CharacterTabs
          basicMoves={data.moves.basicMoves}
          character={character}
          specialMoves={data.moves.specialMoves}
        />
      </div>
    </>
  );
};
