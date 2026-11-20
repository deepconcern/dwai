"use client";

import { useMutation } from "@apollo/client/react";
import { FC, FormEventHandler, useState } from "react";

import { graphql } from "@/gql";
import { MAX_DAMAGE_DICE, parseDamage, rollDamage } from "@/lib/dice";
import { errorMessages } from "@/lib/errorMessages";

import { Button } from "./Button";
import { ErrorList } from "./ErrorList";
import { Modal } from "./Modal";
import { RollMethodFields } from "./RollMethodFields";
import { TextInput } from "./TextInput";

const POST_DAMAGE_MUTATION = graphql(`
  mutation PostDamage($id: ID!, $input: DamageRollInput!) {
    campaigns {
      postDamage(id: $id, input: $input) {
        id
      }
    }
  }
`);

const POST_MONSTER_DAMAGE_MUTATION = graphql(`
  mutation PostMonsterDamage($input: DamageRollInput!, $monsterId: ID!) {
    campaigns {
      postMonsterDamage(input: $input, monsterId: $monsterId) {
        id
      }
    }
  }
`);

export type DamageDialogProps = {
  /** The campaign whose chat the roll is posted to. */
  campaignId: string;
  /** The damage to start with, e.g. the class's damage die (`d10`). */
  initialExpression: string;
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /**
   * For the GM: the monster in play whose damage this is, posted under the
   * monster's name. Without it, the roll is the player's character's.
   */
  monster?: {
    /** The attack's name, shown before the dice, e.g. "Club". */
    attackName: string;
    id: string;
    name: string;
  };
  /** Called when the dialog closes. */
  onClose: () => void;
};

/**
 * Rolls damage and posts it to the campaign chat: a player's (starting with
 * their class's damage die), or, for the GM, a monster's (starting with its
 * attack's damage). Dice and bonuses can be added (`d10+1d4+2`, or `b[2d8]`
 * for best of two). It doesn't change anyone's HP.
 */
export const DamageDialog: FC<DamageDialogProps> = ({
  campaignId,
  initialExpression,
  isOpen,
  monster,
  onClose,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [expression, setExpression] = useState(initialExpression);
  const [gmOnly, setGmOnly] = useState(false);
  const [manualTotal, setManualTotal] = useState("");
  const [method, setMethod] = useState<"app" | "manual">("app");
  const [postDamage, { loading: playerLoading }] =
    useMutation(POST_DAMAGE_MUTATION);
  const [postMonsterDamage, { loading: monsterLoading }] = useMutation(
    POST_MONSTER_DAMAGE_MUTATION,
  );
  const loading = playerLoading || monsterLoading;

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    setErrors([]);

    const parsed = parseDamage(expression);
    if (!parsed.ok) {
      setErrors([parsed.error]);
      return;
    }

    const { dice, modifiers } = rollDamage(parsed.terms);
    const dicePart = expression.replace(/\s+/g, "");
    const input = {
      ...(method === "app" ? { dice } : { diceTotal: Number(manualTotal) }),
      gmOnly,
      // The API takes labels of up to 60 characters.
      label: (monster ? `${monster.attackName}: ${dicePart}` : dicePart).slice(
        0,
        60,
      ),
      modifiers,
    };
    try {
      if (monster) {
        await postMonsterDamage({
          variables: { input, monsterId: monster.id },
        });
      } else {
        await postDamage({ variables: { id: campaignId, input } });
      }
      onClose();
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        aria-label="Roll damage"
        className="flex flex-col max-w-md space-y-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl">
          {monster ? `Roll damage for ${monster.name}` : "Roll damage"}
        </h2>
        <label className="flex flex-col gap-1">
          Damage
          <TextInput
            onChange={(ev) => setExpression(ev.target.value)}
            required
            value={expression}
          />
          <span className="text-gray-400 text-sm">
            Add dice or bonuses, like d10+1d4+2, or b[2d8] for the best of two
            (up to {MAX_DAMAGE_DICE} dice).
          </span>
        </label>
        <RollMethodFields
          manualLabel="Your dice total (bonuses are added for you)"
          manualMax={100}
          manualMin={0}
          manualTotal={manualTotal}
          method={method}
          onManualTotalChange={setManualTotal}
          onMethodChange={setMethod}
        />
        <label className="flex gap-2 items-center">
          <input
            checked={gmOnly}
            onChange={(ev) => setGmOnly(ev.target.checked)}
            type="checkbox"
          />
          Only the GM sees it
        </label>
        <ErrorList errors={errors} />
        <div className="flex gap-2 justify-end">
          <Button onClick={onClose} type="button">
            Cancel
          </Button>
          <Button disabled={loading} type="submit">
            Roll Damage
          </Button>
        </div>
      </form>
    </Modal>
  );
};
