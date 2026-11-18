"use client";

import { useMutation } from "@apollo/client/react";
import { FC, FormEventHandler, useState } from "react";

import { BonusFragment } from "@/fragments/BonusFragment";
import { CampaignCharacterFragment } from "@/fragments/CampaignCharacterFragment";
import { MoveFragment } from "@/fragments/MoveFragment";
import { FragmentType, graphql, unmaskFragment } from "@/gql";
import { Ability, CharacterFragmentFragment } from "@/gql/graphql";
import {
  debilityFor,
  debilityLabel,
  effectiveModifier,
  formatModifier,
} from "@/lib/debilities";
import { RollModifier, rollMove } from "@/lib/dice";
import { errorMessages } from "@/lib/errorMessages";
import { ABILITY_ABBREVIATIONS, suggestedStat } from "@/lib/rolls";

import { Button } from "./Button";
import { ErrorList } from "./ErrorList";
import { Modal } from "./Modal";
import { RollMethodFields } from "./RollMethodFields";

const POST_ROLL_MUTATION = graphql(`
  mutation PostRoll($id: ID!, $input: RollInput!) {
    campaigns {
      postRoll(id: $id, input: $input) {
        id
      }
    }
  }
`);

const REMOVE_BONUS_MUTATION = graphql(`
  mutation RemoveBonus($bonusId: ID!) {
    characters {
      removeBonus(bonusId: $bonusId) {
        bonuses {
          ...BonusFragment
        }
        id
      }
    }
  }
`);

/** What to add to the roll: a stat, the bonds with a target, or nothing. */
type StatChoice = Ability | "BOND" | "NONE" | "";

const ABILITIES = Object.keys(ABILITY_ABBREVIATIONS) as Ability[];

export type RollDialogProps = {
  /** The campaign whose chat the roll is posted to. */
  campaignId: string;
  /** The character rolling. */
  character: CharacterFragmentFragment;
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /** The move being rolled, or null for a generic roll. */
  move: FragmentType<typeof MoveFragment> | null;
  /** Called when the dialog closes. */
  onClose: () => void;
};

/**
 * Rolls a move (or a generic "Roll +STAT") and posts it to the campaign
 * chat. The dialog suggests a stat, the matching debility, and the
 * character's bonuses, but the player chooses everything that's added: the
 * table is an honor system. The player can let the app roll, or enter the
 * total of physical dice. Give the dialog a new `key` for each move, so it
 * starts fresh.
 */
export const RollDialog: FC<RollDialogProps> = ({
  campaignId,
  character,
  isOpen,
  move: moveFragment,
  onClose,
}) => {
  const move = moveFragment ? unmaskFragment(MoveFragment, moveFragment) : null;
  const suggestion = suggestedStat(move?.roll ?? null);
  const initialStat: StatChoice =
    suggestion?.kind === "stat"
      ? suggestion.ability
      : suggestion?.kind === "bond"
        ? "BOND"
        : suggestion?.kind === "none"
          ? "NONE"
          : "";

  const [bondCount, setBondCount] = useState(0);
  const [checkedBonusIds, setCheckedBonusIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [gmOnly, setGmOnly] = useState(false);
  const [manualTotal, setManualTotal] = useState("");
  const [method, setMethod] = useState<"app" | "manual">("app");
  const [stat, setStat] = useState<StatChoice>(initialStat);
  const [usedForwardIds, setUsedForwardIds] = useState<string[] | null>(null);
  // The debility box follows the stat until the player touches it.
  const [debilityOverride, setDebilityOverride] = useState<boolean | null>(
    null,
  );
  const [postRoll, { loading }] = useMutation(POST_ROLL_MUTATION);
  const [removeBonus] = useMutation(REMOVE_BONUS_MUTATION);

  const bonuses = character.bonuses.map((b) =>
    unmaskFragment(BonusFragment, b),
  );
  const bonds = unmaskFragment(CampaignCharacterFragment, character).bonds;
  const ability =
    stat !== "" && stat !== "BOND" && stat !== "NONE" ? stat : null;
  const debility = ability ? debilityFor(ability) : null;
  const debilityActive = !!debility && character.debilities.includes(debility);
  const applyDebility = debilityOverride ?? debilityActive;
  const baseModifier = ability
    ? character.abilities.find((a) => a.ability === ability)!.modifier
    : 0;

  const modifiers: RollModifier[] = [];
  if (ability) {
    modifiers.push({
      label: ABILITY_ABBREVIATIONS[ability],
      value: baseModifier,
    });
  }
  if (stat === "BOND") modifiers.push({ label: "bonds", value: bondCount });
  if (ability && debility && applyDebility) {
    modifiers.push({ label: debilityLabel(debility).toLowerCase(), value: -1 });
  }
  for (const bonus of bonuses) {
    if (checkedBonusIds.includes(bonus.id)) {
      modifiers.push({
        label: `${bonus.kind.toLowerCase()} (${bonus.label})`,
        value: bonus.amount,
      });
    }
  }
  const modifierTotal = modifiers.reduce((sum, m) => sum + m.value, 0);

  const label = move
    ? move.name
    : ability
      ? `Roll +${ABILITY_ABBREVIATIONS[ability]}`
      : "Roll";

  const toggleBonus = (id: string) =>
    setCheckedBonusIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    setErrors([]);
    try {
      await postRoll({
        variables: {
          id: campaignId,
          input: {
            ...(method === "app"
              ? { dice: rollMove() }
              : { diceTotal: Number(manualTotal) }),
            gmOnly,
            label,
            modifiers,
            moveKey: move?.key,
          },
        },
      });
    } catch (error) {
      setErrors(errorMessages(error));
      return;
    }

    const usedForwards = bonuses
      .filter((b) => b.kind === "FORWARD" && checkedBonusIds.includes(b.id))
      .map((b) => b.id);
    if (usedForwards.length > 0) setUsedForwardIds(usedForwards);
    else onClose();
  };

  const handleRemoveForwards = async () => {
    setErrors([]);
    try {
      for (const bonusId of usedForwardIds ?? []) {
        await removeBonus({ variables: { bonusId } });
      }
      onClose();
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  if (usedForwardIds) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div
          aria-label="Remove used bonuses"
          className="flex flex-col max-w-md space-y-4"
          role="group"
        >
          <h2 className="text-xl">Rolled. Remove the forward you used?</h2>
          <ul className="list-disc ml-6">
            {bonuses
              .filter((b) => usedForwardIds.includes(b.id))
              .map((b) => (
                <li key={b.id}>
                  {formatModifier(b.amount)} forward: {b.label}
                </li>
              ))}
          </ul>
          <ErrorList errors={errors} />
          <div className="flex gap-2 justify-end">
            <Button onClick={onClose} type="button">
              Keep
            </Button>
            <Button onClick={handleRemoveForwards} type="button">
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        aria-label={`Roll ${label}`}
        className="flex flex-col max-w-md space-y-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl">{move ? move.name : "Roll"}</h2>
        {move?.roll && (
          <p className="text-gray-300 text-sm">
            The move says: roll {move.roll}.
          </p>
        )}

        <label className="flex flex-col gap-1">
          Add
          <select
            className="border px-3 py-2 rounded"
            onChange={(ev) => {
              setStat(ev.target.value as StatChoice);
              setDebilityOverride(null);
            }}
            required
            value={stat}
          >
            <option className="bg-black" value="">
              Choose what to add
            </option>
            {ABILITIES.map((a) => (
              <option className="bg-black" key={a} value={a}>
                {ABILITY_ABBREVIATIONS[a]} (
                {formatModifier(
                  effectiveModifier(
                    a,
                    character.abilities.find((s) => s.ability === a)!.modifier,
                    character.debilities,
                  ),
                )}
                )
              </option>
            ))}
            <option className="bg-black" value="BOND">
              Bonds with them
            </option>
            <option className="bg-black" value="NONE">
              Nothing
            </option>
          </select>
        </label>

        {stat === "BOND" && (
          <label className="flex flex-col gap-1">
            Your bonds with them
            <input
              className="border px-3 py-2 rounded"
              min={0}
              onChange={(ev) => setBondCount(Number(ev.target.value))}
              type="number"
              value={bondCount}
            />
            {bonds.length > 0 && (
              <span className="text-gray-400 text-sm">
                Your bonds: {bonds.map((b) => b.target.name).join(", ")}
              </span>
            )}
          </label>
        )}

        {ability && debility && (
          <label className="flex gap-2 items-center">
            <input
              checked={applyDebility}
              onChange={(ev) => setDebilityOverride(ev.target.checked)}
              type="checkbox"
            />
            {debilityLabel(debility)} (-1)
            {debilityActive ? "" : " (not marked on your sheet)"}
          </label>
        )}

        {bonuses.length > 0 && (
          <fieldset className="flex flex-col gap-1">
            <legend>Bonuses that apply</legend>
            {bonuses.map((bonus) => (
              <label className="flex gap-2 items-center" key={bonus.id}>
                <input
                  checked={checkedBonusIds.includes(bonus.id)}
                  onChange={() => toggleBonus(bonus.id)}
                  type="checkbox"
                />
                {formatModifier(bonus.amount)} {bonus.kind.toLowerCase()}:{" "}
                {bonus.label}
              </label>
            ))}
          </fieldset>
        )}

        <RollMethodFields
          manualLabel="Your 2d6 total"
          manualMax={12}
          manualMin={2}
          manualTotal={manualTotal}
          method={method}
          onManualTotalChange={setManualTotal}
          onMethodChange={setMethod}
        />

        <p className="text-gray-300">
          2d6 {modifierTotal !== 0 && formatModifier(modifierTotal)}
          {method === "manual" &&
            manualTotal !== "" &&
            ` = ${Number(manualTotal) + modifierTotal}`}
        </p>

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
            Roll
          </Button>
        </div>
      </form>
    </Modal>
  );
};
