"use client";

import { ReactNode, useState } from "react";

import { MoveFragment } from "@/fragments/MoveFragment";
import { FragmentType } from "@/gql";
import { CharacterFragmentFragment } from "@/gql/graphql";

import { DamageDialog } from "./DamageDialog";
import { RollDialog } from "./RollDialog";

/** What {@link useRollDialogs} returns. */
export type RollDialogs = {
  /** The open dialog, to render somewhere on the page. */
  dialogs: ReactNode;
  openDamage: () => void;
  /** Opens the roll dialog for a move, or for a generic roll with null. */
  openRoll: (move: FragmentType<typeof MoveFragment> | null) => void;
};

/**
 * The roll and damage dialogs for a character in a campaign, shared by the
 * campaign page and the character sheet.
 */
export const useRollDialogs = (
  campaignId: string,
  character: CharacterFragmentFragment,
): RollDialogs => {
  const [open, setOpen] = useState<
    | { kind: "damage"; serial: number }
    | {
        kind: "roll";
        move: FragmentType<typeof MoveFragment> | null;
        serial: number;
      }
    | null
  >(null);
  // A new serial per opening remounts the dialog, so it starts fresh.
  const [serial, setSerial] = useState(0);

  const close = () => setOpen(null);

  return {
    dialogs:
      open?.kind === "roll" ? (
        <RollDialog
          campaignId={campaignId}
          character={character}
          isOpen
          key={open.serial}
          move={open.move}
          onClose={close}
        />
      ) : open?.kind === "damage" ? (
        <DamageDialog
          campaignId={campaignId}
          character={character}
          isOpen
          key={open.serial}
          onClose={close}
        />
      ) : null,
    openDamage: () => {
      setSerial(serial + 1);
      setOpen({ kind: "damage", serial: serial + 1 });
    },
    openRoll: (move) => {
      setSerial(serial + 1);
      setOpen({ kind: "roll", move, serial: serial + 1 });
    },
  };
};
