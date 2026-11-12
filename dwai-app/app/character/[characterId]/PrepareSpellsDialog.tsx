"use client";

import { useMutation } from "@apollo/client/react";
import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useCallback,
  useState,
} from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { Modal } from "@/components/Modal";
import { SpellCard } from "@/components/SpellCard";
import { SpellFragment } from "@/fragments/SpellFragment";
import { FragmentType, graphql, unmaskFragment } from "@/gql";
import { CharacterFragmentFragment } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { totalSpellLevels } from "@/lib/spells";

const PREPARE_SPELLS_MUTATION = graphql(`
  mutation PrepareSpells($characterId: ID!, $spellKeys: [ID!]!) {
    spells {
      prepare(characterId: $characterId, spellKeys: $spellKeys) {
        ...CharacterFragment
      }
    }
  }
`);

export type PrepareSpellsDialogProps = {
  /** The Wizard or Cleric preparing spells. */
  character: CharacterFragmentFragment;
  /** Called when the dialog closes, by cancelling or after preparing. */
  onClose: () => void;
  /**
   * The spells to choose from: a Wizard's spellbook, or the Cleric list.
   * Spells above the character's level are hidden; the API rejects them.
   */
  spells: FragmentType<typeof SpellFragment>[];
  /** "Prepare Spells" for a Wizard, "Commune" for a Cleric. */
  title: string;
};

/**
 * Prepare Spells (Wizard) or Commune (Cleric): pick the spells to prepare,
 * replacing the current ones. Render it only while it should show. Shows the total level against the limit; the
 * API enforces it.
 */
export const PrepareSpellsDialog: FC<PrepareSpellsDialogProps> = ({
  character,
  onClose,
  spells,
  title,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  // Starts from what is prepared now; the dialog is mounted only while open.
  const [selected, setSelected] = useState(() =>
    character.preparedSpells.map(
      ({ spell }) => unmaskFragment(SpellFragment, spell).key,
    ),
  );
  const [prepare, { loading }] = useMutation(PREPARE_SPELLS_MUTATION);

  const choices = spells
    .map((s) => ({ ref: s, spell: unmaskFragment(SpellFragment, s) }))
    .filter(({ spell }) => spell.level <= character.level);
  const total = totalSpellLevels(
    choices.map(({ spell }) => spell),
    selected,
  );

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (ev) => {
      const { checked, value } = ev.currentTarget;
      setSelected((current) =>
        checked ? [...current, value] : current.filter((k) => k !== value),
      );
    },
    [],
  );

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (ev) => {
      ev.preventDefault();
      setErrors([]);
      try {
        await prepare({
          variables: { characterId: character.id, spellKeys: selected },
        });
        onClose();
      } catch (error) {
        setErrors(errorMessages(error));
      }
    },
    [character.id, onClose, prepare, selected],
  );

  return (
    <Modal isOpen onClose={onClose}>
      <form
        aria-label={title}
        className="flex flex-col max-w-3xl space-y-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl">{title}</h2>
        <p role="status">
          {total} / {character.maxPreparedSpellLevels} levels chosen
        </p>
        <fieldset className="flex flex-col max-h-96 overflow-y-auto space-y-2">
          <legend className="mb-2">Choose spells to prepare</legend>
          {choices.length === 0 && <p>No spells to prepare.</p>}
          {choices.map(({ ref, spell }) => (
            <label className="flex gap-2 items-start" key={spell.key}>
              <input
                aria-label={spell.name}
                checked={selected.includes(spell.key)}
                className="mt-4"
                onChange={handleChange}
                type="checkbox"
                value={spell.key}
              />
              <SpellCard className="flex-1" spell={ref} />
            </label>
          ))}
        </fieldset>
        <ErrorList errors={errors} />
        <div className="flex gap-2 justify-end">
          <Button onClick={onClose} type="button">
            Cancel
          </Button>
          <Button disabled={loading} type="submit">
            {title}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
