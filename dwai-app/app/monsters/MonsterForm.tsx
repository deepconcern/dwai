"use client";

import { FC, FormEventHandler, useState } from "react";

import { Button } from "@/components/Button";
import { ErrorList } from "@/components/ErrorList";
import { TagsField } from "@/components/TagsField";
import { TextInput } from "@/components/TextInput";
import { errorMessages } from "@/lib/errorMessages";
import {
  MonsterFormState,
  MonsterInputValue,
  monsterInput,
} from "@/lib/monsters";

/** Attack tags to suggest: the ranges and properties monsters use most. */
const ATTACK_TAG_SUGGESTIONS = [
  "Close",
  "Far",
  "Forceful",
  "Hand",
  "Messy",
  "Near",
  "Reach",
];

export type MonsterFormProps = {
  /** The starting values: blank, a copy, or the monster being edited. */
  initial: MonsterFormState;
  onCancel?: () => void;
  /** Saves the monster; a thrown error is shown on the form. */
  onSubmit: (input: MonsterInputValue) => Promise<void>;
  submitLabel: string;
  /** Monster tags to suggest (those the compendium uses). */
  tagSuggestions: readonly string[];
};

/**
 * A custom monster's stat block. Only the name is required: leave HP,
 * armor, and the attack blank for an NPC. The API checks the rest.
 */
export const MonsterForm: FC<MonsterFormProps> = ({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
  tagSuggestions,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof MonsterFormState>(
    key: K,
    value: MonsterFormState[K],
  ) => setForm({ ...form, [key]: value });

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    setErrors([]);
    setSaving(true);
    try {
      await onSubmit(monsterInput(form));
    } catch (error) {
      setErrors(errorMessages(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      aria-label="Monster"
      className="flex flex-col gap-4 max-w-2xl"
      onSubmit={handleSubmit}
    >
      <label className="flex flex-col gap-1">
        Name
        <TextInput
          maxLength={60}
          onChange={(ev) => set("name", ev.target.value)}
          required
          value={form.name}
        />
      </label>
      <TagsField
        label="Tags"
        onChange={(tags) => set("tags", tags)}
        suggestions={tagSuggestions}
        tags={form.tags}
      />
      <div className="flex gap-4">
        <label className="flex flex-col gap-1">
          HP
          <TextInput
            className="w-24"
            max={999}
            min={1}
            onChange={(ev) => set("hp", ev.target.value)}
            type="number"
            value={form.hp}
          />
        </label>
        <label className="flex flex-col gap-1">
          Armor
          <TextInput
            className="w-24"
            max={10}
            min={0}
            onChange={(ev) => set("armor", ev.target.value)}
            type="number"
            value={form.armor}
          />
        </label>
      </div>
      <fieldset className="border flex flex-col gap-2 p-2 rounded">
        <legend>Attack (leave blank for none)</legend>
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col gap-1">
            Attack name
            <TextInput
              maxLength={60}
              onChange={(ev) => set("attackName", ev.target.value)}
              placeholder="Bite"
              value={form.attackName}
            />
          </label>
          <label className="flex flex-col gap-1">
            Damage
            <TextInput
              className="w-32"
              onChange={(ev) => set("attackDamage", ev.target.value)}
              placeholder="d8+1"
              value={form.attackDamage}
            />
          </label>
          <label className="flex flex-col gap-1">
            Piercing
            <TextInput
              className="w-24"
              max={10}
              min={0}
              onChange={(ev) => set("attackPiercing", ev.target.value)}
              type="number"
              value={form.attackPiercing}
            />
          </label>
          <label className="flex gap-2 items-center self-end py-2">
            <input
              checked={form.attackIgnoresArmor}
              onChange={(ev) => set("attackIgnoresArmor", ev.target.checked)}
              type="checkbox"
            />
            Ignores armor
          </label>
        </div>
        <span className="text-gray-400 text-sm">
          Damage is dice like d8, 2d6+1, b[2d10] (best of two), or w[2d8] (worst
          of two).
        </span>
        <TagsField
          label="Attack tags"
          onChange={(tags) => set("attackTags", tags)}
          suggestions={ATTACK_TAG_SUGGESTIONS}
          tags={form.attackTags}
        />
      </fieldset>
      <label className="flex flex-col gap-1">
        Instinct
        <TextInput
          maxLength={200}
          onChange={(ev) => set("instinct", ev.target.value)}
          placeholder="To devour"
          value={form.instinct}
        />
      </label>
      <label className="flex flex-col gap-1">
        Description
        <textarea
          className="border px-3 py-2 rounded"
          maxLength={2000}
          onChange={(ev) => set("description", ev.target.value)}
          rows={4}
          value={form.description}
        />
      </label>
      <label className="flex flex-col gap-1">
        Special qualities (one per line)
        <textarea
          className="border px-3 py-2 rounded"
          onChange={(ev) => set("specialQualities", ev.target.value)}
          rows={2}
          value={form.specialQualities}
        />
      </label>
      <label className="flex flex-col gap-1">
        Moves (one per line)
        <textarea
          className="border px-3 py-2 rounded"
          onChange={(ev) => set("moves", ev.target.value)}
          rows={4}
          value={form.moves}
        />
      </label>
      <ErrorList errors={errors} />
      <div className="flex gap-2">
        <Button disabled={saving} type="submit">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button className="bg-gray-700" onClick={onCancel} type="button">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
