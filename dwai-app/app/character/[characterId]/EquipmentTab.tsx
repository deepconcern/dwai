"use client";

import { useMutation } from "@apollo/client/react";
import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  MouseEventHandler,
  useCallback,
  useState,
} from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { Section } from "@/components/Section";
import { TextInput } from "@/components/TextInput";
import { ItemFragment } from "@/fragments/ItemFragment";
import { graphql, unmaskFragment } from "@/gql";
import { CharacterFragmentFragment } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";
import { getOperationName } from "@/lib/getOperationName";
import { loadWarning } from "@/lib/loadWarning";

import { AddItemForm } from "./AddItemForm";
import { GET_CHARACTER_QUERY } from "./GET_CHARACTER_QUERY";

const ADJUST_GOLD_MUTATION = graphql(`
  mutation AdjustGold($delta: Int!, $id: ID!) {
    characters {
      adjustGold(delta: $delta, id: $id) {
        ...CharacterFragment
      }
    }
  }
`);

const REMOVE_ITEM_MUTATION = graphql(`
  mutation RemoveItem($id: ID!) {
    items {
      remove(id: $id) {
        ...CharacterFragment
      }
    }
  }
`);

const SET_ITEM_COUNT_MUTATION = graphql(`
  mutation SetItemCount($count: Int!, $id: ID!) {
    items {
      setCount(count: $count, id: $id) {
        ...ItemFragment
      }
    }
  }
`);

const TOGGLE_ITEM_WORN_MUTATION = graphql(`
  mutation ToggleItemWorn($id: ID!, $worn: Boolean!) {
    items {
      setWorn(id: $id, worn: $worn) {
        ...ItemFragment
      }
    }
  }
`);

export type EquipmentTabProps = {
  /** The character whose gold and items are shown and changed. */
  character: CharacterFragmentFragment;
};

/**
 * Gold, load vs. max load, and the inventory: change an item's count, wear
 * it, remove it, or add a new one.
 */
export const EquipmentTab: FC<EquipmentTabProps> = ({ character }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [goldChange, setGoldChange] = useState("");

  // Item changes alter derived stats (armor, load), so refetch the sheet.
  const refetch = { refetchQueries: [getOperationName(GET_CHARACTER_QUERY)] };
  const [adjustGold, { loading: goldLoading }] =
    useMutation(ADJUST_GOLD_MUTATION);
  const [removeItem] = useMutation(REMOVE_ITEM_MUTATION, refetch);
  const [setItemCount] = useMutation(SET_ITEM_COUNT_MUTATION, refetch);
  const [toggleItemWorn, { loading: wornLoading }] = useMutation(
    TOGGLE_ITEM_WORN_MUTATION,
    refetch,
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

  const handleGold = useCallback<FormEventHandler<HTMLFormElement>>(
    async (ev) => {
      ev.preventDefault();
      // The submitter says whether to add or spend.
      const submitter = (ev.nativeEvent as SubmitEvent)
        .submitter as HTMLButtonElement | null;
      const sign = submitter?.value === "spend" ? -1 : 1;

      const ok = await run(() =>
        adjustGold({
          variables: { delta: sign * Number(goldChange), id: character.id },
        }),
      );
      if (ok) setGoldChange("");
    },
    [adjustGold, character.id, goldChange, run],
  );

  const handleCount = useCallback<ChangeEventHandler<HTMLInputElement>>(
    async (ev) => {
      const id = ev.currentTarget.dataset.itemId;
      const count = Number(ev.currentTarget.value);
      if (!id || !Number.isInteger(count)) return;

      await run(() => setItemCount({ variables: { count, id } }));
    },
    [run, setItemCount],
  );

  const handleRemove = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async (ev) => {
      const id = ev.currentTarget.dataset.itemId;
      if (!id) return;

      await run(() => removeItem({ variables: { id } }));
    },
    [removeItem, run],
  );

  const handleToggle = useCallback<ChangeEventHandler<HTMLInputElement>>(
    async (ev) => {
      if (wornLoading) return;

      const id = ev.currentTarget.dataset.itemId;
      const worn = ev.currentTarget.checked;
      if (!id) return;

      await run(() => toggleItemWorn({ variables: { id, worn } }));
    },
    [run, toggleItemWorn, wornLoading],
  );

  const warning = loadWarning(character.load, character.maxLoad);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        <Section className="flex-1" title="Gold">
          <form
            aria-label="Gold"
            className="flex flex-wrap gap-2 items-center"
            onSubmit={handleGold}
          >
            <p className="mr-4">Gold: {character.gold}</p>
            <TextInput
              aria-label="Gold amount"
              className="w-24"
              min={0}
              onChange={(ev) => setGoldChange(ev.target.value)}
              required
              type="number"
              value={goldChange}
            />
            <Button disabled={goldLoading} type="submit" value="add">
              Add Gold
            </Button>
            <Button disabled={goldLoading} type="submit" value="spend">
              Spend Gold
            </Button>
          </form>
        </Section>
        <Section className="flex-1" title="Load">
          <p>
            Load: {character.load} / {character.maxLoad}
          </p>
          {warning && (
            <p className="text-yellow-400" role="status">
              {warning}
            </p>
          )}
        </Section>
      </div>

      <ErrorList errors={errors} />

      <table className="border border-collapse table-fixed">
        <thead>
          <tr>
            <th>Item</th>
            <th>Count</th>
            <th>Description</th>
            <th>Tags</th>
            <th>Is Worn?</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {character.equipment.map((i) => {
            const item = unmaskFragment(ItemFragment, i);

            const isWearable = !!item.tags.find((t) => t.key === "worn");
            const tags = item.tags.map(
              (t) => t.name + (t.quantity !== null ? ` ${t.quantity}` : ""),
            );
            tags.sort();

            return (
              <tr className="border" key={item.id}>
                <td>{item.label}</td>
                <td>
                  <TextInput
                    aria-label={`${item.label} count`}
                    className="w-20"
                    data-item-id={item.id}
                    // Keyed on the count so a refetch resets the field.
                    defaultValue={item.count}
                    key={item.count}
                    min={1}
                    onBlur={handleCount}
                    type="number"
                  />
                </td>
                <td>{item.description}</td>
                <td>{tags.join(", ")}</td>
                <td>
                  {isWearable && (
                    <label>
                      <input
                        checked={item.isWorn}
                        data-item-id={item.id}
                        onChange={handleToggle}
                        type="checkbox"
                      />{" "}
                      Worn
                    </label>
                  )}
                </td>
                <td>
                  <Button
                    aria-label={`Remove ${item.label}`}
                    data-item-id={item.id}
                    onClick={handleRemove}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <AddItemForm characterId={character.id} />
    </div>
  );
};
