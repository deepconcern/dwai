"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { FC, FormEventHandler, useCallback, useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { ErrorList } from "@/components/ErrorList";
import { Section } from "@/components/Section";
import { TextInput } from "@/components/TextInput";
import { graphql } from "@/gql";
import { AddItemInput } from "@/gql/graphql";
import { errorMessages } from "@/lib/errorMessages";

const ADD_ITEM_MUTATION = graphql(`
  mutation AddItem($characterId: ID!, $input: AddItemInput!) {
    items {
      add(characterId: $characterId, input: $input) {
        ...CharacterFragment
      }
    }
  }
`);

const ITEM_TEMPLATES_QUERY = graphql(`
  query ItemTemplates {
    itemTemplates {
      all {
        key
        label
        type
      }
    }
  }
`);

export type AddItemFormProps = {
  /** The character the item is added to. */
  characterId: string;
};

/**
 * Adds an item to a character, either from the item catalog (services left
 * out) or as a custom item with a name, description, and weight.
 */
export const AddItemForm: FC<AddItemFormProps> = ({ characterId }) => {
  const [count, setCount] = useState("1");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [label, setLabel] = useState("");
  const [templateKey, setTemplateKey] = useState("");
  const [weight, setWeight] = useState("");

  const { data } = useQuery(ITEM_TEMPLATES_QUERY);
  const [addItem, { loading }] = useMutation(ADD_ITEM_MUTATION);

  // Services (an inn stay, a blacksmith) aren't carried, so they're left out.
  const templateItems = useMemo(
    () =>
      (data?.itemTemplates.all ?? [])
        .filter((t) => t.type !== "service")
        .map((t) => ({ label: t.label, value: t.key })),
    [data],
  );

  const submit = useCallback(
    async (input: AddItemInput) => {
      setErrors([]);
      try {
        await addItem({ variables: { characterId, input } });
        return true;
      } catch (error) {
        setErrors(errorMessages(error));
        return false;
      }
    },
    [addItem, characterId],
  );

  const handleAddTemplate = useCallback<FormEventHandler<HTMLFormElement>>(
    async (ev) => {
      ev.preventDefault();
      if (await submit({ count: Number(count), key: templateKey })) {
        setCount("1");
        setTemplateKey("");
      }
    },
    [count, submit, templateKey],
  );

  const handleAddCustom = useCallback<FormEventHandler<HTMLFormElement>>(
    async (ev) => {
      ev.preventDefault();
      const input: AddItemInput = {
        description: description || null,
        key: "custom",
        label,
        tags: weight ? [{ key: "weight", quantity: Number(weight) }] : [],
      };
      if (await submit(input)) {
        setDescription("");
        setLabel("");
        setWeight("");
      }
    },
    [description, label, submit, weight],
  );

  return (
    <Section title="Add Item">
      <div className="flex flex-col space-y-4">
        <form
          aria-label="Add item from catalog"
          className="flex flex-wrap gap-2 items-center"
          onSubmit={handleAddTemplate}
        >
          <Dropdown
            aria-label="Item"
            className="max-w-xs"
            items={templateItems}
            onChange={(ev) => setTemplateKey(ev.target.value)}
            placeholder="Choose an item"
            required
            value={templateKey}
          />
          <TextInput
            aria-label="Count"
            className="w-20"
            min={1}
            onChange={(ev) => setCount(ev.target.value)}
            required
            type="number"
            value={count}
          />
          <Button disabled={loading} type="submit">
            Add Item
          </Button>
        </form>
        <form
          aria-label="Add custom item"
          className="flex flex-wrap gap-2 items-center"
          onSubmit={handleAddCustom}
        >
          <TextInput
            aria-label="Custom item name"
            onChange={(ev) => setLabel(ev.target.value)}
            placeholder="Custom item name"
            required
            value={label}
          />
          <TextInput
            aria-label="Custom item description"
            onChange={(ev) => setDescription(ev.target.value)}
            placeholder="Description"
            value={description}
          />
          <TextInput
            aria-label="Custom item weight"
            className="w-24"
            min={0}
            onChange={(ev) => setWeight(ev.target.value)}
            placeholder="Weight"
            type="number"
            value={weight}
          />
          <Button disabled={loading} type="submit">
            Add Custom Item
          </Button>
        </form>
        <ErrorList errors={errors} />
      </div>
    </Section>
  );
};
