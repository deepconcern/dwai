"use client";

import { useSuspenseQuery } from "@apollo/client/react";
import Link from "next/link";
import { FC, useState } from "react";

import { ButtonLink } from "@/components/ButtonLink";
import { Dropdown } from "@/components/Dropdown";
import { PageTitle } from "@/components/PageTitle";
import { Tabs } from "@/components/Tabs";
import { TextInput } from "@/components/TextInput";
import { filterMonsters, groupBySetting } from "@/lib/monsters";

import { GET_MONSTERS_QUERY } from "./GET_MONSTERS_QUERY";

export type MonstersPageClientProps = {
  initialTab: "compendium" | "mine";
};

type MonsterSummary = {
  armor?: number | null;
  hp?: number | null;
  id: string;
  name: string;
  tags: string[];
};

type MonsterRowProps = {
  href: string;
  monster: MonsterSummary;
};

/** One monster in a list: its name (linked), HP, armor, and tags. */
const MonsterRow: FC<MonsterRowProps> = ({ href, monster }) => (
  <li className="flex flex-wrap gap-x-3">
    <Link className="hover:underline" href={href}>
      {monster.name}
    </Link>
    <span className="text-gray-400 text-sm">
      {[
        monster.hp != null && `${monster.hp} HP`,
        monster.armor != null && `${monster.armor} armor`,
        monster.tags.join(", "),
      ]
        .filter(Boolean)
        .join(" · ")}
    </span>
  </li>
);

/**
 * The compendium, searchable by name and filterable by setting and tag, and
 * the user's own monsters.
 */
export const MonstersPageClient: FC<MonstersPageClientProps> = ({
  initialTab,
}) => {
  const { data } = useSuspenseQuery(GET_MONSTERS_QUERY);
  const [search, setSearch] = useState("");
  const [setting, setSetting] = useState("");
  const [tab, setTab] = useState<string>(initialTab);
  const [tag, setTag] = useState("");

  const { compendium, mine, settings, tags } = data.monsters;
  const groups = groupBySetting(
    filterMonsters(compendium, { search, setting, tag }),
  );

  return (
    <div className="flex flex-col p-4 space-y-4">
      <PageTitle title="Monsters" />
      <Tabs
        activeTab={tab}
        onTabChange={setTab}
        tabs={[
          {
            label: "Compendium",
            render: () => (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <TextInput
                    aria-label="Search by name"
                    className="flex-1"
                    onChange={(ev) => setSearch(ev.target.value)}
                    placeholder="Search by name"
                    type="search"
                    value={search}
                  />
                  <Dropdown
                    aria-label="Setting"
                    className="sm:w-56"
                    items={settings.map((s) => ({
                      label: s.name,
                      value: s.key,
                    }))}
                    onChange={(ev) => setSetting(ev.target.value)}
                    placeholder="Any setting"
                    value={setting}
                  />
                  <Dropdown
                    aria-label="Tag"
                    className="sm:w-48"
                    items={tags.map((t) => ({ label: t, value: t }))}
                    onChange={(ev) => setTag(ev.target.value)}
                    placeholder="Any tag"
                    value={tag}
                  />
                </div>
                {groups.length === 0 && <p>No monsters match.</p>}
                {groups.map((group) => (
                  <section aria-label={group.name} key={group.name}>
                    <h3 className="font-semibold mb-1 text-lg">{group.name}</h3>
                    <ul className="flex flex-col gap-1">
                      {group.monsters.map((monster) => (
                        <MonsterRow
                          href={`/monsters/${monster.id}`}
                          key={monster.id}
                          monster={monster}
                        />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ),
            tab: "compendium",
          },
          {
            label: "My monsters",
            render: () => (
              <div className="flex flex-col gap-4">
                {mine.length === 0 ? (
                  <p>
                    You haven&apos;t written any monsters yet. Write one from
                    scratch, or copy one from the compendium.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {mine.map((monster) => (
                      <MonsterRow
                        href={`/monsters/custom/${monster.id}`}
                        key={monster.id}
                        monster={monster}
                      />
                    ))}
                  </ul>
                )}
                <p>
                  <ButtonLink href="/monsters/new">New Monster</ButtonLink>
                </p>
              </div>
            ),
            tab: "mine",
          },
        ]}
      />
    </div>
  );
};
