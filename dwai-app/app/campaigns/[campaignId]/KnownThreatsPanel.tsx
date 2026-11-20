"use client";

import { useQuery, useSubscription } from "@apollo/client/react";
import { FC, useEffect } from "react";

import { Section } from "@/components/Section";
import { graphql } from "@/gql";
import { onReconnected } from "@/lib/reconnect";

export const GET_KNOWN_THREATS_QUERY = graphql(`
  query GetKnownThreats($id: ID!) {
    campaigns {
      byId(id: $id) {
        id
        knownThreats {
          dangerId
          name
          portents
          type
        }
      }
    }
  }
`);

const KNOWN_THREATS_CHANGED_SUBSCRIPTION = graphql(`
  subscription KnownThreatsChanged($campaignId: ID!) {
    knownThreatsChanged(campaignId: $campaignId)
  }
`);

export type KnownThreatsPanelProps = {
  campaignId: string;
};

/**
 * The dangers the GM has revealed, with their revealed grim portents. It's
 * hidden until something is revealed, and reloads live whenever the GM
 * reveals or hides something.
 */
export const KnownThreatsPanel: FC<KnownThreatsPanelProps> = ({
  campaignId,
}) => {
  const { data, refetch } = useQuery(GET_KNOWN_THREATS_QUERY, {
    variables: { id: campaignId },
  });
  useSubscription(KNOWN_THREATS_CHANGED_SUBSCRIPTION, {
    onData: () => void refetch(),
    variables: { campaignId },
  });

  // Reload what changed while the connection was down.
  useEffect(() => onReconnected(() => void refetch()), [refetch]);

  const threats = data?.campaigns.byId.knownThreats ?? [];
  if (threats.length === 0) return null;

  return (
    <Section title="Known threats">
      <ul aria-label="Known threats" className="flex flex-col gap-2">
        {threats.map((threat) => (
          <li aria-label={threat.name} key={threat.dangerId}>
            <span className="font-semibold">{threat.name}</span>
            {threat.type && (
              <span className="text-gray-400"> ({threat.type})</span>
            )}
            {threat.portents.length > 0 && (
              <ul className="list-disc pl-6">
                {threat.portents.map((p, i) => (
                  // Portents can repeat, and their order never changes.
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
};
