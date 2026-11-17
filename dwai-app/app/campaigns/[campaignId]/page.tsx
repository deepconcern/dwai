import { FC, Suspense } from "react";

import { PreloadQuery } from "@/lib/apollo-client";
import { requireUser } from "@/lib/session";

import { CampaignPageClient } from "./CampaignPageClient";
import { GET_CAMPAIGN_QUERY } from "./GET_CAMPAIGN_QUERY";

export const CampaignPage: FC<{
  params: Promise<{ campaignId: string }>;
}> = async ({ params }) => {
  const { campaignId } = await params;
  await requireUser(`/campaigns/${campaignId}`);

  return (
    <PreloadQuery query={GET_CAMPAIGN_QUERY} variables={{ id: campaignId }}>
      <Suspense fallback={<>Loading...</>}>
        <CampaignPageClient campaignId={campaignId} />
      </Suspense>
    </PreloadQuery>
  );
};

export default CampaignPage;
