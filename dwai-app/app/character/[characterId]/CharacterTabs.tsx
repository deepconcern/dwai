"use client";

import { FC, useMemo, useState } from "react";

import { SectionTitle } from "@/components/SectionTitle";
import { TabItem, Tabs } from "@/components/Tabs";
import { MoveFragment } from "@/fragments/MoveFragment";
import { FragmentType } from "@/gql";
import { CharacterFragmentFragment } from "@/gql/graphql";

import { BasicInfoTab } from "./BasicInfoTab";
import { EquipmentTab } from "./EquipmentTab";
import { MovesDisplay } from "./MovesDisplay";
import { SpellsTab } from "./SpellsTab";

export type CharacterTabsProps = {
  basicMoves: FragmentType<typeof MoveFragment>[];
  character: CharacterFragmentFragment;
  specialMoves: FragmentType<typeof MoveFragment>[];
};

export const CharacterTabs: FC<CharacterTabsProps> = ({
  basicMoves,
  character,
  specialMoves,
}) => {
  const [activeTab, setActiveTab] = useState("basic");

  const tabs = useMemo<TabItem[]>(
    () => [
      {
        label: "Basic Info",
        render: () => <BasicInfoTab character={character} />,
        tab: "basic",
      },
      {
        label: "Class Moves",
        render: () => (
          <div className="flex flex-col space-y-4">
            <section>
              <SectionTitle title="Starting Moves" />
              <MovesDisplay moves={character.classMoves} />
            </section>
            <section>
              <SectionTitle title="Advanced Moves" />
              {character.advancedMoves.length > 0 ? (
                <MovesDisplay moves={character.advancedMoves} />
              ) : (
                <p>None yet: choose one each time you level up.</p>
              )}
            </section>
          </div>
        ),
        tab: "class-moves",
      },
      {
        label: "Basic Moves",
        render: () => <MovesDisplay moves={basicMoves} />,
        tab: "basic-moves",
      },
      {
        label: "Special Moves",
        render: () => <MovesDisplay moves={specialMoves} />,
        tab: "special-moves",
      },
      {
        label: "Equipment",
        render: () => <EquipmentTab character={character} />,
        tab: "equipment",
      },
      // Only spellcasters (Wizards and Clerics) have a preparation limit.
      ...(character.maxPreparedSpellLevels === null
        ? []
        : [
            {
              label: "Spells",
              render: () => <SpellsTab character={character} />,
              tab: "spells",
            },
          ]),
    ],
    [basicMoves, character, specialMoves],
  );

  return (
    <Tabs
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab)}
      tabs={tabs}
    />
  );
};
