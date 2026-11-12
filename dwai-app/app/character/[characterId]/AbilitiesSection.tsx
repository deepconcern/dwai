"use client";

import { useMutation } from "@apollo/client/react";
import { ChangeEventHandler, FC, useCallback, useState } from "react";

import { ErrorList } from "@/components/ErrorList";
import { SectionTitle } from "@/components/SectionTitle";
import { graphql } from "@/gql";
import { CharacterFragmentFragment, Debility } from "@/gql/graphql";
import {
  debilityFor,
  debilityLabel,
  effectiveModifier,
  formatModifier,
} from "@/lib/debilities";
import { errorMessages } from "@/lib/errorMessages";

const SET_DEBILITY_MUTATION = graphql(`
  mutation SetDebility($active: Boolean!, $debility: Debility!, $id: ID!) {
    characters {
      setDebility(active: $active, debility: $debility, id: $id) {
        ...CharacterFragment
      }
    }
  }
`);

export type AbilitiesSectionProps = {
  /** The character whose abilities and debilities are shown. */
  character: CharacterFragmentFragment;
};

/**
 * The six abilities with their scores and modifiers. Each has a checkbox for
 * its debility; an active one shows the modifier 1 lower, with the base
 * modifier beside it.
 */
export const AbilitiesSection: FC<AbilitiesSectionProps> = ({ character }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [setDebility, { loading }] = useMutation(SET_DEBILITY_MUTATION);

  const handleDebilityChange = useCallback<
    ChangeEventHandler<HTMLInputElement>
  >(
    async (ev) => {
      const debility = ev.currentTarget.dataset.debility as Debility;
      const active = ev.currentTarget.checked;

      setErrors([]);
      try {
        await setDebility({
          variables: { active, debility, id: character.id },
        });
      } catch (error) {
        setErrors(errorMessages(error));
      }
    },
    [character.id, setDebility],
  );

  return (
    <section>
      <SectionTitle title="Abilities" />
      <div className="flex justify-around space-x-4">
        {character.abilities.map(({ ability, modifier, score }) => {
          const debility = debilityFor(ability);
          const isDebilitated = character.debilities.includes(debility);
          const effective = effectiveModifier(
            ability,
            modifier,
            character.debilities,
          );

          return (
            <div
              aria-label={ability}
              className="border flex flex-col items-center justify-center p-2 rounded"
              key={ability}
              role="group"
            >
              <h4>{ability}</h4>
              <strong
                aria-label={`${ability} modifier`}
                className={isDebilitated ? "text-2xl text-red-400" : "text-2xl"}
              >
                {formatModifier(effective)}
              </strong>
              {isDebilitated && (
                <p className="text-sm">Base {formatModifier(modifier)}</p>
              )}
              <p>Score: {score}</p>
              <label>
                <input
                  checked={isDebilitated}
                  data-debility={debility}
                  disabled={loading}
                  onChange={handleDebilityChange}
                  type="checkbox"
                />{" "}
                {debilityLabel(debility)}
              </label>
            </div>
          );
        })}
      </div>
      <ErrorList errors={errors} />
    </section>
  );
};
