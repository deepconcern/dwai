"use client";

import { FC } from "react";

import { MoveFragment } from "@/fragments/MoveFragment";
import { FragmentType, unmaskFragment } from "@/gql";
import { CharacterFragmentFragment } from "@/gql/graphql";

import { Button } from "./Button";
import { Section } from "./Section";
import { useRollDialogs } from "./useRollDialogs";

export type RollPanelProps = {
  /** Basic and special moves, which every character has. */
  basicMoves: FragmentType<typeof MoveFragment>[];
  /** The campaign whose chat rolls are posted to. */
  campaignId: string;
  /** The player's character. */
  character: CharacterFragmentFragment;
  specialMoves: FragmentType<typeof MoveFragment>[];
};

/**
 * The player's roll buttons at the table: each move that rolls, a generic
 * roll, and damage. Results go to the campaign chat.
 */
export const RollPanel: FC<RollPanelProps> = ({
  basicMoves,
  campaignId,
  character,
  specialMoves,
}) => {
  const { dialogs, openDamage, openRoll } = useRollDialogs(
    campaignId,
    character,
  );

  const groups = [
    {
      moves: [
        character.raceMove,
        ...character.classMoves,
        ...character.advancedMoves,
      ],
      title: "Class moves",
    },
    { moves: basicMoves, title: "Basic moves" },
    { moves: specialMoves, title: "Special moves" },
  ].map(({ moves, title }) => ({
    moves: moves.filter((m) => unmaskFragment(MoveFragment, m).roll),
    title,
  }));

  return (
    <Section title={`Roll as ${character.name}`}>
      <div className="flex flex-col space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => openRoll(null)}>Roll +Stat</Button>
          <Button onClick={openDamage}>
            Damage (d{character.characterClass.damageDie})
          </Button>
        </div>
        {groups.map(({ moves, title }) =>
          moves.length === 0 ? null : (
            <div key={title}>
              <h4 className="text-gray-400 text-sm">{title}</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {moves.map((m) => {
                  const move = unmaskFragment(MoveFragment, m);

                  return (
                    <button
                      className="border hover:bg-neutral-800 px-2 py-1 rounded text-sm"
                      key={move.key}
                      onClick={() => openRoll(m)}
                      title={move.trigger ?? undefined}
                      type="button"
                    >
                      {move.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ),
        )}
      </div>
      {dialogs}
    </Section>
  );
};
