"use client";

import { useMutation } from "@apollo/client/react";
import { FC, FormEventHandler, useCallback, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { Section } from "@/components/Section";
import { TextInput } from "@/components/TextInput";
import { graphql } from "@/gql";
import { CharacterFragmentFragment } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";

const HEAL_MUTATION = graphql(`
  mutation Heal($amount: Int!, $id: ID!) {
    characters {
      heal(amount: $amount, id: $id) {
        ...CharacterFragment
      }
    }
  }
`);

const TAKE_DAMAGE_MUTATION = graphql(`
  mutation TakeDamage($id: ID!, $input: TakeDamageInput!) {
    characters {
      takeDamage(id: $id, input: $input) {
        ...CharacterFragment
      }
    }
  }
`);

export type HealthSectionProps = {
  character: CharacterFragmentFragment;
};

export const HealthSection: FC<HealthSectionProps> = ({ character }) => {
  const [damage, setDamage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [healing, setHealing] = useState("");
  const [ignoresArmor, setIgnoresArmor] = useState(false);
  const [piercing, setPiercing] = useState("");

  const [heal, { loading: healLoading }] = useMutation(HEAL_MUTATION);
  const [takeDamage, { loading: damageLoading }] =
    useMutation(TAKE_DAMAGE_MUTATION);

  const handleTakeDamage = useCallback<FormEventHandler<HTMLFormElement>>(
    async (ev) => {
      ev.preventDefault();
      setErrors([]);
      try {
        await takeDamage({
          variables: {
            id: character.id,
            input: {
              amount: Number(damage),
              ignoresArmor,
              piercing: Number(piercing || 0),
            },
          },
        });
        setDamage("");
        setIgnoresArmor(false);
        setPiercing("");
      } catch (error) {
        setErrors(errorMessages(error));
      }
    },
    [character.id, damage, ignoresArmor, piercing, takeDamage],
  );

  const handleHeal = useCallback<FormEventHandler<HTMLFormElement>>(
    async (ev) => {
      ev.preventDefault();
      setErrors([]);
      try {
        await heal({
          variables: { amount: Number(healing), id: character.id },
        });
        setHealing("");
      } catch (error) {
        setErrors(errorMessages(error));
      }
    },
    [character.id, heal, healing],
  );

  return (
    <Section className="flex-1" title="Health">
      <div className="flex flex-col space-y-4">
        <div className="flex space-x-8">
          <p>
            HP: {character.hitPoints} / {character.maxHitPoints}
          </p>
          <p>Armor: {character.armor}</p>
        </div>
        {character.isDying && (
          <p className="font-bold text-red-400" role="status">
            At 0 HP: make the Last Breath move.
          </p>
        )}
        <form
          aria-label="Take damage"
          className="flex flex-wrap gap-2 items-center"
          onSubmit={handleTakeDamage}
        >
          <TextInput
            aria-label="Damage"
            className="w-24"
            min={0}
            onChange={(ev) => setDamage(ev.target.value)}
            placeholder="Damage"
            required
            type="number"
            value={damage}
          />
          <TextInput
            aria-label="Piercing"
            className="w-24"
            min={0}
            onChange={(ev) => setPiercing(ev.target.value)}
            placeholder="Piercing"
            type="number"
            value={piercing}
          />
          <label>
            <input
              checked={ignoresArmor}
              onChange={(ev) => setIgnoresArmor(ev.target.checked)}
              type="checkbox"
            />{" "}
            Ignores armor
          </label>
          <Button disabled={damageLoading} type="submit">
            Take Damage
          </Button>
        </form>
        <form
          aria-label="Heal"
          className="flex flex-wrap gap-2 items-center"
          onSubmit={handleHeal}
        >
          <TextInput
            aria-label="Healing"
            className="w-24"
            min={0}
            onChange={(ev) => setHealing(ev.target.value)}
            placeholder="Healing"
            required
            type="number"
            value={healing}
          />
          <Button disabled={healLoading} type="submit">
            Heal
          </Button>
        </form>
        <ErrorList errors={errors} />
      </div>
    </Section>
  );
};
