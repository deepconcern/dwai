"use client";

import { useMutation } from "@apollo/client/react";
import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { ErrorList } from "@/components/ErrorList";
import { Modal } from "@/components/Modal";
import { MoveCard } from "@/components/MoveCard";
import { MoveFragment } from "@/fragments/MoveFragment";
import { graphql, unmaskFragment } from "@/gql";
import { Ability, CharacterFragmentFragment } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { levelUpAbilityOptions } from "@/lib/levelUpAbilities";

const LEVEL_UP_MUTATION = graphql(`
  mutation LevelUp($id: ID!, $input: LevelUpInput!) {
    characters {
      levelUp(id: $id, input: $input) {
        ...CharacterFragment
      }
    }
  }
`);

export type LevelUpDialogProps = {
  /** The character leveling up. */
  character: CharacterFragmentFragment;
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /** Called when the dialog closes, by cancelling or after leveling up. */
  onClose: () => void;
};

/**
 * The Level Up move: pick a stat to raise by 1 and one of the advanced moves
 * the API says are available, then submit. The API spends the XP and
 * applies everything else.
 */
export const LevelUpDialog: FC<LevelUpDialogProps> = ({
  character,
  isOpen,
  onClose,
}) => {
  const [ability, setAbility] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [moveKey, setMoveKey] = useState("");
  const [levelUp, { loading }] = useMutation(LEVEL_UP_MUTATION);

  const abilityOptions = useMemo(
    () => levelUpAbilityOptions(character.abilities),
    [character.abilities],
  );

  const handleAbilityChange = useCallback<
    ChangeEventHandler<HTMLSelectElement>
  >((ev) => setAbility(ev.target.value), []);

  const handleMoveChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (ev) => setMoveKey(ev.target.value),
    [],
  );

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (ev) => {
      ev.preventDefault();
      setErrors([]);
      try {
        await levelUp({
          variables: {
            id: character.id,
            input: { ability: ability as Ability, advancedMoveKey: moveKey },
          },
        });
        setAbility("");
        setMoveKey("");
        onClose();
      } catch (error) {
        setErrors(errorMessages(error));
      }
    },
    [ability, character.id, levelUp, moveKey, onClose],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        aria-label={`Level up to ${character.level + 1}`}
        className="flex flex-col max-w-3xl space-y-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl">Level up to {character.level + 1}</h2>
        <Dropdown
          aria-label="Ability to raise"
          items={abilityOptions}
          onChange={handleAbilityChange}
          placeholder="Raise an ability by 1"
          required
          value={ability}
        />
        <fieldset className="flex flex-col max-h-96 overflow-y-auto space-y-2">
          <legend className="mb-2">Choose an advanced move</legend>
          {character.availableAdvancedMoves.map((m) => {
            const move = unmaskFragment(MoveFragment, m);

            return (
              <label className="flex gap-2 items-start" key={move.key}>
                <input
                  checked={moveKey === move.key}
                  className="mt-4"
                  name="advanced-move"
                  onChange={handleMoveChange}
                  required
                  type="radio"
                  value={move.key}
                />
                <MoveCard className="flex-1" move={m} />
              </label>
            );
          })}
        </fieldset>
        <ErrorList errors={errors} />
        <div className="flex gap-2 justify-end">
          <Button onClick={onClose} type="button">
            Cancel
          </Button>
          <Button disabled={loading} type="submit">
            Level Up
          </Button>
        </div>
      </form>
    </Modal>
  );
};
