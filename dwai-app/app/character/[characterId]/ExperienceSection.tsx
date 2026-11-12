"use client";

import { useMutation } from "@apollo/client/react";
import { FC, MouseEventHandler, useCallback, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { Section } from "@/components/Section";
import { graphql } from "@/gql";
import { CharacterFragmentFragment } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";

import { LevelUpDialog } from "./LevelUpDialog";

const ADJUST_XP_MUTATION = graphql(`
  mutation AdjustXp($delta: Int!, $id: ID!) {
    characters {
      adjustXp(delta: $delta, id: $id) {
        ...CharacterFragment
      }
    }
  }
`);

export type ExperienceSectionProps = {
  /** The character whose level and XP are shown and changed. */
  character: CharacterFragmentFragment;
};

/**
 * Level and XP toward the next level, with buttons to mark or unmark XP
 * and, once the character has enough, to level up.
 */
export const ExperienceSection: FC<ExperienceSectionProps> = ({
  character,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isLevelUpOpen, setLevelUpOpen] = useState(false);
  const [adjustXp, { loading }] = useMutation(ADJUST_XP_MUTATION);

  const handleAdjust = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async (ev) => {
      const delta = Number(ev.currentTarget.value);

      setErrors([]);
      try {
        await adjustXp({ variables: { delta, id: character.id } });
      } catch (error) {
        setErrors(errorMessages(error));
      }
    },
    [adjustXp, character.id],
  );

  const handleClose = useCallback(() => setLevelUpOpen(false), []);
  const handleOpen = useCallback(() => setLevelUpOpen(true), []);

  return (
    <Section className="flex-1" title="Experience">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <p className="mr-4">
            Level {character.level}, XP: {character.xp} / {character.xpToLevel}
          </p>
          <Button
            aria-label="Mark XP"
            disabled={loading}
            onClick={handleAdjust}
            value={1}
          >
            +1 XP
          </Button>
          <Button
            aria-label="Unmark XP"
            disabled={loading || character.xp === 0}
            onClick={handleAdjust}
            value={-1}
          >
            -1 XP
          </Button>
          <Button disabled={!character.canLevelUp} onClick={handleOpen}>
            Level Up
          </Button>
        </div>
        <ErrorList errors={errors} />
      </div>
      <LevelUpDialog
        character={character}
        isOpen={isLevelUpOpen}
        onClose={handleClose}
      />
    </Section>
  );
};
