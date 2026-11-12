"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  MouseEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { ErrorList } from "@/components/ErrorList";
import { Section } from "@/components/Section";
import { SpellCard } from "@/components/SpellCard";
import { SpellFragment } from "@/fragments/SpellFragment";
import { graphql, unmaskFragment } from "@/gql";
import { CharacterFragmentFragment } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { spellbookWarning } from "@/lib/spells";

import { PrepareSpellsDialog } from "./PrepareSpellsDialog";

const ADD_TO_SPELLBOOK_MUTATION = graphql(`
  mutation AddToSpellbook($characterId: ID!, $spellKey: ID!) {
    spells {
      addToSpellbook(characterId: $characterId, spellKey: $spellKey) {
        ...CharacterFragment
      }
    }
  }
`);

const REMOVE_FROM_SPELLBOOK_MUTATION = graphql(`
  mutation RemoveFromSpellbook($characterId: ID!, $spellKey: ID!) {
    spells {
      removeFromSpellbook(characterId: $characterId, spellKey: $spellKey) {
        ...CharacterFragment
      }
    }
  }
`);

const SET_FORGOTTEN_MUTATION = graphql(`
  mutation SetSpellForgotten(
    $characterId: ID!
    $forgotten: Boolean!
    $spellKey: ID!
  ) {
    spells {
      setForgotten(
        characterId: $characterId
        forgotten: $forgotten
        spellKey: $spellKey
      ) {
        ...CharacterFragment
      }
    }
  }
`);

const SPELLS_BY_CLASS_QUERY = graphql(`
  query SpellsByClass($classKey: ID!) {
    spells {
      byClass(classKey: $classKey) {
        ...SpellFragment
      }
    }
  }
`);

export type SpellsTabProps = {
  /** A Wizard or Cleric. */
  character: CharacterFragmentFragment;
};

/**
 * A spellcaster's spells: cantrips or rotes (always prepared), a Wizard's
 * spellbook, and the prepared spells with their forgotten marks. The API
 * enforces the spellbook and preparation rules.
 */
export const SpellsTab: FC<SpellsTabProps> = ({ character }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isPrepareOpen, setPrepareOpen] = useState(false);
  const [spellToAdd, setSpellToAdd] = useState("");

  const { data } = useQuery(SPELLS_BY_CLASS_QUERY, {
    variables: { classKey: character.characterClass.key },
  });
  const [addToSpellbook, { loading: addLoading }] = useMutation(
    ADD_TO_SPELLBOOK_MUTATION,
  );
  const [removeFromSpellbook] = useMutation(REMOVE_FROM_SPELLBOOK_MUTATION);
  const [setForgotten] = useMutation(SET_FORGOTTEN_MUTATION);

  const usesSpellbook = character.expectedSpellbookSize !== null;
  const isCleric = !usesSpellbook;

  const classSpells = useMemo(
    () =>
      (data?.spells.byClass ?? []).map((ref) => ({
        ref,
        spell: unmaskFragment(SpellFragment, ref),
      })),
    [data],
  );
  const spellbook = useMemo(
    () => character.spellbook.map((s) => unmaskFragment(SpellFragment, s)),
    [character.spellbook],
  );

  const cantrips = classSpells.filter(({ spell }) => spell.level === 0);

  // A Wizard prepares from the spellbook; a Cleric from the cleric list.
  const preparable = usesSpellbook
    ? character.spellbook
    : classSpells.filter(({ spell }) => spell.level > 0).map(({ ref }) => ref);

  const addable = useMemo(
    () =>
      classSpells
        .map(({ spell }) => spell)
        .filter(
          (s) =>
            s.level > 0 &&
            s.level <= character.level &&
            !spellbook.some((b) => b.key === s.key),
        )
        .map((s) => ({ label: `${s.name} (level ${s.level})`, value: s.key })),
    [character.level, classSpells, spellbook],
  );

  const run = useCallback(async (action: () => Promise<unknown>) => {
    setErrors([]);
    try {
      await action();
      return true;
    } catch (error) {
      setErrors(errorMessages(error));
      return false;
    }
  }, []);

  const handleAdd = useCallback<FormEventHandler<HTMLFormElement>>(
    async (ev) => {
      ev.preventDefault();
      const ok = await run(() =>
        addToSpellbook({
          variables: { characterId: character.id, spellKey: spellToAdd },
        }),
      );
      if (ok) setSpellToAdd("");
    },
    [addToSpellbook, character.id, run, spellToAdd],
  );

  const handleRemove = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async (ev) => {
      const spellKey = ev.currentTarget.value;
      await run(() =>
        removeFromSpellbook({
          variables: { characterId: character.id, spellKey },
        }),
      );
    },
    [character.id, removeFromSpellbook, run],
  );

  const handleForgotten = useCallback<ChangeEventHandler<HTMLInputElement>>(
    async (ev) => {
      const spellKey = ev.currentTarget.value;
      const forgotten = ev.currentTarget.checked;
      await run(() =>
        setForgotten({
          variables: { characterId: character.id, forgotten, spellKey },
        }),
      );
    },
    [character.id, run, setForgotten],
  );

  const handleSpellToAddChange = useCallback<
    ChangeEventHandler<HTMLSelectElement>
  >((ev) => setSpellToAdd(ev.target.value), []);

  const handleClose = useCallback(() => setPrepareOpen(false), []);
  const handleOpen = useCallback(() => setPrepareOpen(true), []);

  const warning = spellbookWarning(
    spellbook.length,
    character.expectedSpellbookSize,
  );

  return (
    <div className="flex flex-col space-y-4">
      <ErrorList errors={errors} />

      <Section title={isCleric ? "Rotes" : "Cantrips"}>
        <div className="grid gap-4 grid-cols-2">
          {cantrips.map(({ ref, spell }) => (
            <SpellCard key={spell.key} spell={ref} />
          ))}
        </div>
      </Section>

      {usesSpellbook && (
        <Section title="Spellbook">
          <div className="flex flex-col space-y-4">
            {warning && (
              <p className="text-yellow-400" role="status">
                {warning}
              </p>
            )}
            <div className="grid gap-4 grid-cols-2">
              {character.spellbook.map((s) => {
                const spell = unmaskFragment(SpellFragment, s);

                return (
                  <SpellCard
                    actions={
                      <Button
                        aria-label={`Remove ${spell.name} from spellbook`}
                        onClick={handleRemove}
                        value={spell.key}
                      >
                        Remove
                      </Button>
                    }
                    key={spell.key}
                    spell={s}
                  />
                );
              })}
            </div>
            <form
              aria-label="Add to spellbook"
              className="flex gap-2 items-center"
              onSubmit={handleAdd}
            >
              <Dropdown
                aria-label="Spell"
                className="max-w-xs"
                items={addable}
                onChange={handleSpellToAddChange}
                placeholder="Choose a spell"
                required
                value={spellToAdd}
              />
              <Button disabled={addLoading} type="submit">
                Add to Spellbook
              </Button>
            </form>
          </div>
        </Section>
      )}

      <Section
        title={`Prepared Spells (${character.preparedSpellLevels} / ${character.maxPreparedSpellLevels} levels)`}
      >
        <div className="flex flex-col space-y-4">
          {character.preparedSpells.length === 0 && <p>None prepared.</p>}
          <div className="grid gap-4 grid-cols-2">
            {character.preparedSpells.map(({ isForgotten, spell: s }) => {
              const spell = unmaskFragment(SpellFragment, s);

              return (
                <SpellCard
                  actions={
                    <label className="whitespace-nowrap">
                      <input
                        checked={isForgotten}
                        onChange={handleForgotten}
                        type="checkbox"
                        value={spell.key}
                      />{" "}
                      Forgotten
                    </label>
                  }
                  className={isForgotten ? "opacity-50" : null}
                  key={spell.key}
                  spell={s}
                />
              );
            })}
          </div>
          <div>
            <Button onClick={handleOpen}>
              {isCleric ? "Commune" : "Prepare Spells"}
            </Button>
          </div>
        </div>
      </Section>

      {isPrepareOpen && (
        <PrepareSpellsDialog
          character={character}
          onClose={handleClose}
          spells={preparable}
          title={isCleric ? "Commune" : "Prepare Spells"}
        />
      )}
    </div>
  );
};
