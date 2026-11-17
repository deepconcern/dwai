"use client";

import { useSuspenseQuery } from "@apollo/client/react";
import { notFound } from "next/navigation";
import { FC, useState } from "react";

import { Button } from "@/components/Button";
import { PageTitle } from "@/components/PageTitle";
import { SessionReportDialog } from "@/components/SessionReportDialog";
import { CampaignCharacterFragment } from "@/fragments/CampaignCharacterFragment";
import { unmaskFragment } from "@/gql";

import { CampaignDetails } from "./CampaignDetails";
import { EndOfSessionDialog } from "./EndOfSessionDialog";
import { GET_CAMPAIGN_QUERY } from "./GET_CAMPAIGN_QUERY";
import { InviteLink } from "./InviteLink";
import { PartyList } from "./PartyList";
import { SessionLog } from "./SessionLog";

export type CampaignPageClientProps = {
  campaignId: string;
};

/**
 * A campaign: its details, party, invite link (GM), End of Session (the GM
 * starts it, players report), and the session log.
 */
export const CampaignPageClient: FC<CampaignPageClientProps> = ({
  campaignId,
}) => {
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

  return (
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
        <div>
          <Button onClick={() => setEndOpen(true)}>End Session</Button>
          <EndOfSessionDialog
            campaignId={campaign.id}
            isOpen={isEndOpen}
            onClose={() => setEndOpen(false)}
            onEnded={handleChanged}
          />
        </div>
      )}

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

      <SessionLog sessions={campaign.sessions} />
    </div>
  );
};
