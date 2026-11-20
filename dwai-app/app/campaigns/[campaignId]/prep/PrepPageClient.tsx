"use client";

import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { FC, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { PageTitle } from "@/components/PageTitle";
import { Tabs } from "@/components/Tabs";
import { DangerFragment } from "@/fragments/DangerFragment";
import { unmaskFragment } from "@/gql";
import { errorMessages } from "@/lib/errorMessages";

import { DangerCard } from "./DangerCard";
import { DangerForm } from "./DangerForm";
import { EncounterCard } from "./EncounterCard";
import { EncounterForm } from "./EncounterForm";
import { FrontCard } from "./FrontCard";
import { FrontForm } from "./FrontForm";
import { GET_PREP_QUERY } from "./GET_PREP_QUERY";

export type PrepPageClientProps = {
  campaignId: string;
};

/**
 * The GM's prep for a campaign, all optional: fronts with their dangers
 * (and dangers in no front), and encounters. Players can't open it; the API
 * refuses them.
 */
export const PrepPageClient: FC<PrepPageClientProps> = ({ campaignId }) => {
  // The campaign page changes portents and monsters, so don't trust the
  // cache on the way here.
  const { data, error } = useQuery(GET_PREP_QUERY, {
    fetchPolicy: "cache-and-network",
    variables: { id: campaignId },
  });
  const [adding, setAdding] = useState<"danger" | "encounter" | "front" | null>(
    null,
  );
  const [tab, setTab] = useState("fronts");

  if (error) return <ErrorList errors={errorMessages(error)} />;
  if (!data) return <>Loading...</>;

  const campaign = data.campaigns.byId;
  const { categories, impendingDooms } = data.dangerTemplate;
  const fronts = campaign.fronts.map((f) => ({ id: f.id, name: f.name }));
  const dangers = [
    ...campaign.fronts.flatMap((f) =>
      f.dangers.map((d) => unmaskFragment(DangerFragment, d)),
    ),
    ...campaign.dangersWithoutFront.map((d) =>
      unmaskFragment(DangerFragment, d),
    ),
  ].map((d) => ({ id: d.id, name: d.name }));
  const formProps = { campaignId, categories, fronts, impendingDooms };

  return (
    <div className="flex flex-col gap-4">
      <PageTitle title={`Prep: ${campaign.name}`} />
      <p className="text-gray-400">
        Only you can see this page. Everything here is optional: use what helps
        and ignore the rest.{" "}
        <Link className="underline" href={`/campaigns/${campaignId}`}>
          Back to the table
        </Link>
      </p>

      <Tabs
        activeTab={tab}
        onTabChange={(t) => {
          setTab(t);
          setAdding(null);
        }}
        tabs={[
          {
            label: "Fronts",
            render: () => (
              <div className="flex flex-col gap-4">
                {campaign.fronts.length === 0 &&
                  campaign.dangersWithoutFront.length === 0 && (
                    <p>No fronts yet.</p>
                  )}
                {campaign.fronts.map((front) => (
                  <FrontCard front={front} key={front.id} {...formProps} />
                ))}

                {campaign.dangersWithoutFront.length > 0 && (
                  <section className="flex flex-col gap-2">
                    <h3 className="font-semibold text-lg">
                      Dangers without a front
                    </h3>
                    {campaign.dangersWithoutFront.map((masked) => {
                      const danger = unmaskFragment(DangerFragment, masked);
                      return (
                        <DangerCard
                          danger={danger}
                          key={danger.id}
                          {...formProps}
                        />
                      );
                    })}
                  </section>
                )}

                {adding === "front" && (
                  <FrontForm
                    campaignId={campaignId}
                    onDone={() => setAdding(null)}
                  />
                )}
                {adding === "danger" && (
                  <DangerForm {...formProps} onDone={() => setAdding(null)} />
                )}
                {adding === null && (
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setAdding("front")}>
                      Add Front
                    </Button>
                    <Button onClick={() => setAdding("danger")}>
                      Add Danger Without a Front
                    </Button>
                  </div>
                )}
              </div>
            ),
            tab: "fronts",
          },
          {
            label: "Encounters",
            render: () => (
              <div className="flex flex-col gap-4">
                {campaign.encounters.length === 0 && <p>No encounters yet.</p>}
                {campaign.encounters.map((encounter) => (
                  <EncounterCard
                    campaignId={campaignId}
                    compendium={data.monsters.compendium}
                    dangers={dangers}
                    encounter={encounter}
                    key={encounter.id}
                    mine={data.monsters.mine}
                  />
                ))}
                {adding === "encounter" ? (
                  <EncounterForm
                    campaignId={campaignId}
                    dangers={dangers}
                    onDone={() => setAdding(null)}
                  />
                ) : (
                  <div>
                    <Button onClick={() => setAdding("encounter")}>
                      Add Encounter
                    </Button>
                  </div>
                )}
              </div>
            ),
            tab: "encounters",
          },
        ]}
      />
    </div>
  );
};
