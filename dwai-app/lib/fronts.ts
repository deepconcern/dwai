/** What {@link groupMonstersByEncounter} needs of a monster in play. */
export type GroupableMonster = { encounterId?: string | null };

/**
 * Groups monsters in play for the Monsters panel: under each encounter they
 * were put into play from (in the encounters' order), then the rest under
 * "Other monsters". Encounters with no monsters in play are left out.
 */
export const groupMonstersByEncounter = <T extends GroupableMonster>(
  monsters: readonly T[],
  encounters: readonly { id: string; name: string }[],
): { monsters: T[]; name: string }[] => {
  const groups = encounters.map((e) => ({
    id: e.id,
    monsters: [] as T[],
    name: e.name,
  }));
  const other: T[] = [];

  for (const monster of monsters) {
    const group = groups.find((g) => g.id === monster.encounterId);
    if (group) group.monsters.push(monster);
    else other.push(monster);
  }

  const result = groups
    .filter((g) => g.monsters.length > 0)
    .map(({ monsters, name }) => ({ monsters, name }));
  if (other.length > 0)
    result.push({ monsters: other, name: "Other monsters" });

  return result;
};

/** The template's danger categories, as {@link impulseFor} reads them. */
export type TemplateCategories = readonly {
  types: readonly { impulse: string; name: string }[];
}[];

/**
 * The impulse to show after the GM picks a danger type: the template
 * type's impulse when the GM hasn't written one, otherwise theirs. It's
 * only a suggestion; the GM can change it.
 */
export const impulseFor = (
  type: string,
  impulse: string,
  categories: TemplateCategories,
): string => {
  if (impulse.trim() !== "") return impulse;

  const needle = type.trim().toLowerCase();
  for (const category of categories) {
    const match = category.types.find((t) => t.name.toLowerCase() === needle);
    if (match) return match.impulse;
  }

  return impulse;
};

/** How many of a danger's grim portents are checked, as "2 of 5". */
export const portentProgress = (
  portents: readonly { done: boolean }[],
): string => `${portents.filter((p) => p.done).length} of ${portents.length}`;
