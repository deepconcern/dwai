"use client";

import { FC, FormEventHandler, useState } from "react";

import { AddMonstersInput } from "@/gql/graphql";
import { filterMonsters, groupBySetting } from "@/lib/monsters";

import { Button } from "./Button";
import { TextInput } from "./TextInput";

/** A monster the picker can offer. */
export type PickableMonster = {
  hp?: number | null;
  id: string;
  name: string;
  setting?: { key: string; name: string } | null;
  tags: readonly string[];
};

export type MonsterPickerProps = {
  /** The form's accessible name, e.g. "Add monsters". */
  label: string;
  /** The compendium, sorted by setting then name. */
  compendium: readonly PickableMonster[];
  /** The GM's own monsters. */
  mine: readonly PickableMonster[];
  onCancel: () => void;
  /** Called with the monsters to add; it throws to keep the form open. */
  onSubmit: (input: AddMonstersInput) => Promise<void>;
  submitLabel: string;
  submitting?: boolean;
};

/** The value of an option in the monster list. */
const sourceValue = (kind: "compendium" | "custom", id: string) =>
  `${kind}:${id}`;

/**
 * Picks a monster from the compendium or the GM's own monsters, with how
 * many and (when the stat block has none) a max HP. Used to add monsters to
 * play and to an encounter.
 */
export const MonsterPicker: FC<MonsterPickerProps> = ({
  compendium,
  label,
  mine,
  onCancel,
  onSubmit,
  submitLabel,
  submitting = false,
}) => {
  const [count, setCount] = useState("1");
  const [maxHp, setMaxHp] = useState("");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");

  const filters = { search, setting: "", tag: "" };
  const mineShown = filterMonsters(mine, filters);
  const compendiumGroups = groupBySetting(filterMonsters(compendium, filters));
  const selected = source.startsWith("custom:")
    ? mine.find((m) => sourceValue("custom", m.id) === source)
    : compendium.find((m) => sourceValue("compendium", m.id) === source);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    const [kind, id] = source.split(/:(.*)/);
    void onSubmit({
      ...(kind === "custom" ? { customMonsterId: id } : { compendiumKey: id }),
      count: Number(count),
      maxHp: maxHp.trim() === "" ? null : Number(maxHp),
    })
      .then(() => {
        setCount("1");
        setMaxHp("");
        setSource("");
      })
      .catch(() => {
        // The caller shows the errors; keep what was entered.
      });
  };

  return (
    <form
      aria-label={label}
      className="border flex flex-col gap-2 p-2 rounded"
      onSubmit={handleSubmit}
    >
      <TextInput
        aria-label="Search monsters"
        onChange={(ev) => setSearch(ev.target.value)}
        placeholder="Search monsters"
        type="search"
        value={search}
      />
      <select
        aria-label="Monster"
        className="border px-3 py-2 rounded w-full"
        onChange={(ev) => setSource(ev.target.value)}
        required
        value={source}
      >
        <option className="bg-black" value="">
          Choose a monster
        </option>
        {mineShown.length > 0 && (
          <optgroup className="bg-black" label="My monsters">
            {mineShown.map((m) => (
              <option key={m.id} value={sourceValue("custom", m.id)}>
                {m.name}
                {m.hp != null ? ` (${m.hp} HP)` : ""}
              </option>
            ))}
          </optgroup>
        )}
        {compendiumGroups.map((group) => (
          <optgroup className="bg-black" key={group.name} label={group.name}>
            {group.monsters.map((m) => (
              <option key={m.id} value={sourceValue("compendium", m.id)}>
                {m.name}
                {m.hp != null ? ` (${m.hp} HP)` : ""}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1">
          How many
          <TextInput
            className="w-24"
            max={20}
            min={1}
            onChange={(ev) => setCount(ev.target.value)}
            required
            type="number"
            value={count}
          />
        </label>
        <label className="flex flex-col gap-1">
          Max HP{selected && selected.hp == null && " (required)"}
          <TextInput
            className="w-24"
            max={999}
            min={1}
            onChange={(ev) => setMaxHp(ev.target.value)}
            placeholder={selected?.hp?.toString() ?? ""}
            required={selected != null && selected.hp == null}
            type="number"
            value={maxHp}
          />
        </label>
      </div>
      <div className="flex gap-2">
        <Button disabled={submitting} type="submit">
          {submitLabel}
        </Button>
        <Button onClick={onCancel} type="button">
          Cancel
        </Button>
      </div>
    </form>
  );
};
