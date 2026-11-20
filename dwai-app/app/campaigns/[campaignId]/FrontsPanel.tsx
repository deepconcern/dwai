"use client";

import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { FC } from "react";

import { ErrorList } from "@/components/ErrorList";
import { Section } from "@/components/Section";
import { DangerFragment } from "@/fragments/DangerFragment";
import { graphql, unmaskFragment } from "@/gql";
import { errorMessages } from "@/lib/errorMessages";

import { DangerTracker } from "./DangerTracker";

export const GET_CAMPAIGN_DANGERS_QUERY = graphql(`
  query GetCampaignDangers($id: ID!) {
    campaigns {
      byId(id: $id) {
        dangersWithoutFront {
          ...DangerFragment
        }
        fronts {
          dangers {
            ...DangerFragment
          }
          id
          name
          resolved
        }
        id
      }
    }
  }
`);

export type FrontsPanelProps = {
  campaignId: string;
};

/**
 * The GM's dangers during play: those of unresolved fronts and those in no
 * front, with their grim portents to check off and reveal. It's hidden
 * when the campaign has no such dangers, since fronts are optional.
 */
export const FrontsPanel: FC<FrontsPanelProps> = ({ campaignId }) => {
  // The Prep page changes these, so don't trust the cache on the way back.
  const { data, error } = useQuery(GET_CAMPAIGN_DANGERS_QUERY, {
    fetchPolicy: "cache-and-network",
    variables: { id: campaignId },
  });

  if (error) return <ErrorList errors={errorMessages(error)} />;
  if (!data) return null;

  const { dangersWithoutFront, fronts } = data.campaigns.byId;
  const groups = [
    ...fronts
      .filter((f) => !f.resolved)
      .map((f) => ({ dangers: f.dangers, key: f.id, name: f.name })),
    {
      dangers: dangersWithoutFront,
      key: "none",
      name: "Dangers without a front",
    },
  ].filter((g) => g.dangers.length > 0);

  if (groups.length === 0) return null;

  return (
    <Section title="Fronts">
      <div className="flex flex-col gap-4">
        <p className="text-gray-400 text-sm">
          Only you can see this panel.{" "}
          <Link className="underline" href={`/campaigns/${campaignId}/prep`}>
            Edit in Prep
          </Link>
        </p>
        {groups.map((group) => (
          <div className="flex flex-col gap-2" key={group.key}>
            <h4 className="font-semibold">{group.name}</h4>
            <ul aria-label={group.name} className="flex flex-col gap-2">
              {group.dangers.map((masked) => {
                const danger = unmaskFragment(DangerFragment, masked);
                return (
                  <li
                    aria-label={danger.name}
                    className="border flex flex-col gap-1 p-2 rounded"
                    key={danger.id}
                  >
                    <span>
                      {danger.name}
                      {danger.type && (
                        <span className="text-gray-400"> ({danger.type})</span>
                      )}
                    </span>
                    <DangerTracker danger={danger} />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
};
