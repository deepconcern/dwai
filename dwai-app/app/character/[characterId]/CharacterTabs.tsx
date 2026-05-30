"use client";

import { FC, useMemo, useState } from "react";

import { TabItem, Tabs } from "@/components/Tabs";
import { MoveFragment } from "@/fragments/MoveFragment";
import { FragmentType } from "@/gql";
import { CharacterFragmentFragment } from "@/gql/graphql";

import { BasicInfoTab } from "./BasicInfoTab";
import { EquipmentTab } from "./EquipmentTab";
import { MovesDisplay } from "./MovesDisplay";

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
        render: () => <MovesDisplay moves={character.classMoves} />,
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
    ],
    [character],
  );

  return (
    <Tabs
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab)}
      tabs={tabs}
    />
  );
};
