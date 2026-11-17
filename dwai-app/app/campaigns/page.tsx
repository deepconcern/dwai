import Link from "next/link";
import { FC } from "react";

import { List } from "@/components/List";
import { PageTitle } from "@/components/PageTitle";
import { graphql } from "@/gql";
import { query } from "@/lib/apollo-client";
import { requireUser } from "@/lib/session";

import { CreateCampaignForm } from "./CreateCampaignForm";

const GET_MY_CAMPAIGNS_QUERY = graphql(`
  query GetMyCampaigns {
    campaigns {
      mine {
        id
        isGm
        name
      }
    }
  }
`);

/** My Campaigns: the campaigns the user runs or plays in. */
export const CampaignsPage: FC = async () => {
  await requireUser("/campaigns");

  const { data } = await query({
    fetchPolicy: "no-cache",
    query: GET_MY_CAMPAIGNS_QUERY,
  });
  const campaigns = data?.campaigns.mine ?? [];

  return (
    <div className="flex flex-col p-4 space-y-4">
      <PageTitle title="My Campaigns" />
      {campaigns.length === 0 ? (
        <p>
          You&apos;re not in any campaigns yet. Start one, or ask your GM for an
          invite link.
        </p>
      ) : (
        <List
          items={campaigns.map((campaign) => ({
            content: (
              <>
                <Link
                  className="hover:underline"
                  href={`/campaigns/${campaign.id}`}
                >
                  {campaign.name}
                </Link>{" "}
                <span className="text-gray-400">
                  ({campaign.isGm ? "GM" : "Player"})
                </span>
              </>
            ),
            key: campaign.id,
          }))}
        />
      )}
      <CreateCampaignForm />
    </div>
  );
};

export default CampaignsPage;
