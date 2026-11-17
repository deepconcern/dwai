import { FC } from "react";

import { PageTitle } from "@/components/PageTitle";
import { graphql } from "@/gql";
import { query } from "@/lib/apollo-client";
import { requireUser } from "@/lib/session";

import { JoinForm } from "./JoinForm";

const GET_INVITE_QUERY = graphql(`
  query GetInvite($code: String!) {
    campaigns {
      byInviteCode(code: $code) {
        gm {
          displayName
        }
        name
      }
    }
    characters {
      mine {
        campaign {
          id
        }
        id
        name
      }
    }
  }
`);

/**
 * A campaign's join link: shows the campaign and lets the player bring one
 * of their characters that isn't in a campaign yet.
 */
export const JoinPage: FC<{ params: Promise<{ code: string }> }> = async ({
  params,
}) => {
  const { code } = await params;
  await requireUser(`/join/${code}`);

  const { data } = await query({
    errorPolicy: "all",
    fetchPolicy: "no-cache",
    query: GET_INVITE_QUERY,
    variables: { code },
  });
  const invite = data?.campaigns.byInviteCode;

  if (!invite) {
    return (
      <div className="p-4">
        <PageTitle title="Join a Campaign" />
        <p>This invite link isn&apos;t valid. Ask your GM for a new one.</p>
      </div>
    );
  }

  const characters = (data?.characters.mine ?? []).filter((c) => !c.campaign);

  return (
    <div className="flex flex-col p-4 space-y-4">
      <PageTitle title={`Join ${invite.name}`} />
      <p>GM: {invite.gm.displayName}</p>
      <JoinForm characters={characters} code={code} />
    </div>
  );
};

export default JoinPage;
