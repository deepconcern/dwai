"use client";

import { useMutation } from "@apollo/client/react";
import { FC, FormEventHandler, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { Section } from "@/components/Section";
import { TextInput } from "@/components/TextInput";
import { BonusFragment } from "@/fragments/BonusFragment";
import { graphql, unmaskFragment } from "@/gql";
import { BonusKind, CharacterFragmentFragment } from "@/gql/graphql";
import { formatModifier } from "@/lib/debilities";
import { errorMessages } from "@/lib/errorMessages";

const ADD_BONUS_MUTATION = graphql(`
  mutation AddBonus($id: ID!, $input: BonusInput!) {
    characters {
      addBonus(id: $id, input: $input) {
        bonuses {
          ...BonusFragment
        }
        id
      }
    }
  }
`);

const REMOVE_BONUS_FROM_SHEET_MUTATION = graphql(`
  mutation RemoveBonusFromSheet($bonusId: ID!) {
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

export type BonusesSectionProps = {
  character: CharacterFragmentFragment;
};

/**
 * The character's +forward and +ongoing bonuses (or penalties). The roll
 * dialog lists them, and the player ticks the ones that apply. Adding and
 * removing is up to the player.
 */
export const BonusesSection: FC<BonusesSectionProps> = ({ character }) => {
  const [amount, setAmount] = useState("1");
  const [errors, setErrors] = useState<string[]>([]);
  const [kind, setKind] = useState<BonusKind>("FORWARD");
  const [label, setLabel] = useState("");
  const [addBonus, { loading: adding }] = useMutation(ADD_BONUS_MUTATION);
  const [removeBonus, { loading: removing }] = useMutation(
    REMOVE_BONUS_FROM_SHEET_MUTATION,
  );

  const bonuses = character.bonuses.map((b) =>
    unmaskFragment(BonusFragment, b),
  );

  const handleAdd: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    setErrors([]);
    try {
      await addBonus({
        variables: {
          id: character.id,
          input: { amount: Number(amount), kind, label },
        },
      });
      setLabel("");
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  const handleRemove = async (bonusId: string) => {
    setErrors([]);
    try {
      await removeBonus({ variables: { bonusId } });
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  return (
    <Section title="Bonuses">
      <div className="flex flex-col space-y-2">
        {bonuses.length === 0 ? (
          <p className="text-gray-400">
            No bonuses. Add +1 forward from Aid, a blessing, and so on.
          </p>
        ) : (
          <ul className="flex flex-col space-y-1">
            {bonuses.map((bonus) => (
              <li className="flex gap-2 items-center" key={bonus.id}>
                <span className="flex-1">
                  {formatModifier(bonus.amount)} {bonus.kind.toLowerCase()}:{" "}
                  {bonus.label}
                </span>
                {character.viewerIsOwner && (
                  <Button
                    aria-label={`Remove ${bonus.label}`}
                    disabled={removing}
                    onClick={() => handleRemove(bonus.id)}
                  >
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        {character.viewerIsOwner && (
          <form
            aria-label="Add a bonus"
            className="flex flex-wrap gap-2 items-center"
            onSubmit={handleAdd}
          >
            <TextInput
              aria-label="Amount"
              className="w-20"
              max={10}
              min={-10}
              onChange={(ev) => setAmount(ev.target.value)}
              required
              type="number"
              value={amount}
            />
            <select
              aria-label="Kind"
              className="border px-3 py-2 rounded"
              onChange={(ev) => setKind(ev.target.value as BonusKind)}
              value={kind}
            >
              <option className="bg-black" value="FORWARD">
                forward
              </option>
              <option className="bg-black" value="ONGOING">
                ongoing
              </option>
            </select>
            <TextInput
              aria-label="What it's for"
              className="flex-1"
              maxLength={100}
              onChange={(ev) => setLabel(ev.target.value)}
              placeholder="What it's for, e.g. Aid from Lux"
              required
              value={label}
            />
            <Button disabled={adding} type="submit">
              Add Bonus
            </Button>
          </form>
        )}
        <ErrorList errors={errors} />
      </div>
    </Section>
  );
};
