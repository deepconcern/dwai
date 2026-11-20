/** What {@link filterMonsters} needs of a monster. */
export type FilterableMonster = {
  name: string;
  setting?: { key: string; name: string } | null;
  tags: readonly string[];
};

/** The compendium filters. An empty string means "any". */
export type MonsterFilters = {
  search: string;
  setting: string;
  tag: string;
};

/**
 * Narrows the compendium list: the search matches anywhere in the name
 * (ignoring case), and the setting and tag must match exactly. The filters
 * combine.
 */
export const filterMonsters = <T extends FilterableMonster>(
  monsters: readonly T[],
  { search, setting, tag }: MonsterFilters,
): T[] => {
  const needle = search.trim().toLowerCase();

  return monsters.filter(
    (m) =>
      (needle === "" || m.name.toLowerCase().includes(needle)) &&
      (setting === "" || m.setting?.key === setting) &&
      (tag === "" || m.tags.includes(tag)),
  );
};

/**
 * Groups monsters by their setting's name, keeping the list's order (the
 * API sorts the compendium by setting, then name).
 */
export const groupBySetting = <T extends FilterableMonster>(
  monsters: readonly T[],
): { monsters: T[]; name: string }[] => {
  const groups: { monsters: T[]; name: string }[] = [];

  for (const monster of monsters) {
    const name = monster.setting?.name ?? "My monsters";
    const last = groups.at(-1);
    if (last?.name === name) last.monsters.push(monster);
    else groups.push({ monsters: [monster], name });
  }

  return groups;
};

/** Splits a text box into one entry per line, dropping blank lines. */
export const parseList = (text: string): string[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

/** A stat block as {@link monsterFormState} reads it. */
export type StatBlockSource = {
  armor?: number | null;
  attack?: {
    damage: string;
    ignoresArmor: boolean;
    name: string;
    piercing: number;
    tags: readonly string[];
  } | null;
  description: string;
  hp?: number | null;
  instinct: string;
  moves: readonly string[];
  name: string;
  source: "COMPENDIUM" | "CUSTOM";
  sourceKey?: string | null;
  specialQualities: readonly string[];
  tags: readonly string[];
};

/**
 * The custom monster form's fields, as typed. Numbers stay strings so a
 * box can be blank, and moves and special qualities are one per line.
 */
export type MonsterFormState = {
  armor: string;
  attackDamage: string;
  attackIgnoresArmor: boolean;
  attackName: string;
  attackPiercing: string;
  attackTags: string[];
  description: string;
  hp: string;
  instinct: string;
  moves: string;
  name: string;
  sourceKey: string | null;
  specialQualities: string;
  tags: string[];
};

/** A custom monster's stat block, in the shape the API's `MonsterInput` takes. */
export type MonsterInputValue = {
  armor: number | null;
  attack: {
    damage: string;
    ignoresArmor: boolean;
    name: string;
    piercing: number;
    tags: string[];
  } | null;
  description: string;
  hp: number | null;
  instinct: string;
  moves: string[];
  name: string;
  sourceKey: string | null;
  specialQualities: string[];
  tags: string[];
};

/**
 * The form's starting values: blank, or filled from a monster being edited
 * or copied. A copy of a compendium monster remembers its key.
 */
export const monsterFormState = (
  monster: StatBlockSource | null,
): MonsterFormState => ({
  armor: monster?.armor?.toString() ?? "",
  attackDamage: monster?.attack?.damage ?? "",
  attackIgnoresArmor: monster?.attack?.ignoresArmor ?? false,
  attackName: monster?.attack?.name ?? "",
  attackPiercing: monster?.attack?.piercing
    ? monster.attack.piercing.toString()
    : "",
  attackTags: [...(monster?.attack?.tags ?? [])],
  description: monster?.description ?? "",
  hp: monster?.hp?.toString() ?? "",
  instinct: monster?.instinct ?? "",
  moves: monster?.moves.join("\n") ?? "",
  name: monster?.name ?? "",
  sourceKey: monster?.sourceKey ?? null,
  specialQualities: monster?.specialQualities.join("\n") ?? "",
  tags: [...(monster?.tags ?? [])],
});

/** Reads an optional number box: blank is null. */
const optionalNumber = (text: string): number | null =>
  text.trim() === "" ? null : Number(text);

/**
 * Converts the form to the API's input. Blank HP and armor are left out,
 * and so is the attack when both its name and damage are blank (an NPC).
 * The API checks the rest.
 */
export const monsterInput = (form: MonsterFormState): MonsterInputValue => ({
  armor: optionalNumber(form.armor),
  attack:
    form.attackName.trim() === "" && form.attackDamage.trim() === ""
      ? null
      : {
          damage: form.attackDamage,
          ignoresArmor: form.attackIgnoresArmor,
          name: form.attackName,
          piercing: optionalNumber(form.attackPiercing) ?? 0,
          tags: form.attackTags,
        },
  description: form.description,
  hp: optionalNumber(form.hp),
  instinct: form.instinct,
  moves: parseList(form.moves),
  name: form.name,
  sourceKey: form.sourceKey,
  specialQualities: parseList(form.specialQualities),
  tags: form.tags,
});
