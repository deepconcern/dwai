"use client";

import { useMutation } from "@apollo/client/react";
import { FC, FormEventHandler, useState } from "react";

import { graphql } from "@/gql";
import { CharacterFragmentFragment } from "@/gql/graphql";
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

export type DamageDialogProps = {
  /** The campaign whose chat the roll is posted to. */
  campaignId: string;
  /** The character dealing damage. */
  character: CharacterFragmentFragment;
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /** Called when the dialog closes. */
  onClose: () => void;
};

/**
 * Rolls damage and posts it to the campaign chat. It starts with the class's
 * damage die; the player can add dice and bonuses (`d10+1d4+2`, or `b[2d8]`
 * for best of two). It doesn't change anyone's HP.
 */
export const DamageDialog: FC<DamageDialogProps> = ({
  campaignId,
  character,
  isOpen,
  onClose,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [expression, setExpression] = useState(
    `d${character.characterClass.damageDie}`,
  );
  const [gmOnly, setGmOnly] = useState(false);
  const [manualTotal, setManualTotal] = useState("");
  const [method, setMethod] = useState<"app" | "manual">("app");
  const [postDamage, { loading }] = useMutation(POST_DAMAGE_MUTATION);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    setErrors([]);

    const parsed = parseDamage(expression);
    if (!parsed.ok) {
      setErrors([parsed.error]);
      return;
    }

    const { dice, modifiers } = rollDamage(parsed.terms);
    try {
      await postDamage({
        variables: {
          id: campaignId,
          input: {
            ...(method === "app"
              ? { dice }
              : { diceTotal: Number(manualTotal) }),
            gmOnly,
            label: expression.replace(/\s+/g, ""),
            modifiers,
          },
        },
      });
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
        <h2 className="text-xl">Roll damage</h2>
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
