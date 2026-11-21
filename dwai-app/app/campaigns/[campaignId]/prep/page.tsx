import { FC, Suspense } from "react";

import { PreloadQuery } from "@/lib/apollo-client";
import { requireUser } from "@/lib/session";

import { GET_PREP_QUERY } from "./GET_PREP_QUERY";
import { PrepPageClient } from "./PrepPageClient";

export type PrepPageProps = {
  params: Promise<{ campaignId: string }>;
};

/** The GM's prep for a campaign: fronts, dangers, and encounters. */
export const PrepPage: FC<PrepPageProps> = async ({ params }) => {
  const { campaignId } = await params;
  await requireUser(`/campaigns/${campaignId}/prep`);

  return (
    <PreloadQuery query={GET_PREP_QUERY} variables={{ id: campaignId }}>
      <Suspense fallback={<>Loading...</>}>
        <PrepPageClient campaignId={campaignId} />
      </Suspense>
    </PreloadQuery>
  );
};

export default PrepPage;
