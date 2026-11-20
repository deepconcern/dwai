"use client";

import { useApolloClient, useSuspenseQuery } from "@apollo/client/react";
import { notFound } from "next/navigation";
import { FC, useState } from "react";

import { Button } from "@/components/Button";
import { ButtonLink } from "@/components/ButtonLink";
import { PageTitle } from "@/components/PageTitle";
import { RollPanel } from "@/components/RollPanel";
import { SessionReportDialog } from "@/components/SessionReportDialog";
import { CampaignCharacterFragment } from "@/fragments/CampaignCharacterFragment";
import { CharacterFragment } from "@/fragments/CharacterFragment";
import { unmaskFragment } from "@/gql";

import { CampaignDetails } from "./CampaignDetails";
import { ChatPanel } from "./ChatPanel";
import { EndOfSessionDialog } from "./EndOfSessionDialog";
import { FrontsPanel } from "./FrontsPanel";
import { GET_CAMPAIGN_QUERY } from "./GET_CAMPAIGN_QUERY";
import { InviteLink } from "./InviteLink";
import {
  GET_KNOWN_THREATS_QUERY,
  KnownThreatsPanel,
} from "./KnownThreatsPanel";
import { MonstersPanel } from "./MonstersPanel";
import { PartyList } from "./PartyList";
import { SessionLog } from "./SessionLog";

export type CampaignPageClientProps = {
  campaignId: string;
};

/**
 * A campaign is the table: the chat (with rolls and sheet activity) beside
 * its details, party, the player's roll buttons, invite link (GM), the GM's
 * fronts and monsters in play (with a link to the Prep page), the threats
 * the GM has revealed (players), End of Session (the GM starts it, players
 * report), and the session log.
 */
export const CampaignPageClient: FC<CampaignPageClientProps> = ({
  campaignId,
}) => {
  const client = useApolloClient();
  const [isEndOpen, setEndOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);
  const { data, refetch } = useSuspenseQuery(GET_CAMPAIGN_QUERY, {
    variables: { id: campaignId },
  });

  if (!data) notFound();

  const campaign = data.campaigns.byId;
  const myCharacter = campaign.myCharacter;
  const pendingSession = myCharacter
    ? unmaskFragment(CampaignCharacterFragment, myCharacter).pendingSession
    : null;
  const handleChanged = () => void refetch();
  const handleActivity = (body: string) => {
    if (body.startsWith("The GM revealed")) {
      void client.refetchQueries({ include: [GET_KNOWN_THREATS_QUERY] });
    }
  };

  return (
    <div className="gap-4 grid lg:grid-cols-2">
      <div className="flex flex-col space-y-4">
        <PageTitle title={campaign.name} />
        <p className="text-gray-400">GM: {campaign.gm.displayName}</p>

        <CampaignDetails campaign={campaign} />

        {campaign.isGm && campaign.inviteCode && (
          <InviteLink campaignId={campaign.id} code={campaign.inviteCode} />
        )}

        <PartyList
          campaignId={campaign.id}
          characters={campaign.characters}
          isGm={campaign.isGm}
          myCharacterId={myCharacter?.id ?? null}
          onChanged={handleChanged}
        />

        {campaign.isGm && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setEndOpen(true)}>End Session</Button>
            <ButtonLink href={`/campaigns/${campaign.id}/prep`}>
              Prep: Fronts &amp; Encounters
            </ButtonLink>
            <EndOfSessionDialog
              campaignId={campaign.id}
              isOpen={isEndOpen}
              onClose={() => setEndOpen(false)}
              onEnded={handleChanged}
            />
          </div>
        )}

        {!campaign.isGm && <KnownThreatsPanel campaignId={campaign.id} />}

        {campaign.isGm && <FrontsPanel campaignId={campaign.id} />}

        {campaign.isGm && <MonstersPanel campaignId={campaign.id} />}

        {myCharacter && pendingSession && (
          <div
            className="border border-yellow-400 flex gap-4 items-center p-2 rounded"
            role="status"
          >
            <p className="flex-1">
              End of Session {pendingSession.number} is waiting for your report.
            </p>
            <Button onClick={() => setReportOpen(true)}>Report</Button>
            <SessionReportDialog
              character={myCharacter}
              isOpen={isReportOpen}
              onClose={() => setReportOpen(false)}
              onSubmitted={handleChanged}
            />
          </div>
        )}

        {myCharacter && (
          <RollPanel
            basicMoves={data.moves.basicMoves}
            campaignId={campaign.id}
            character={unmaskFragment(CharacterFragment, myCharacter)}
            specialMoves={data.moves.specialMoves}
          />
        )}

        <SessionLog sessions={campaign.sessions} />
      </div>
      <div className="lg:sticky lg:top-4 self-start">
        <ChatPanel campaign={campaign} onActivity={handleActivity} />
      </div>
    </div>
  );
};
