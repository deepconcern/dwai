/**
 * Returns a warning when a Wizard's spellbook doesn't hold the number of
 * spells the API expects (3, plus 1 per level gained), or null. Only a
 * reminder: the spellbook can hold any number.
 */
export const spellbookWarning = (
  size: number,
  expected: number | null | undefined,
): string | null => {
  if (expected === null || expected === undefined || size === expected) {
    return null;
  }

  return size < expected
    ? `Your spellbook has ${size} of ${expected} spells: add ${expected - size} more.`
    : `Your spellbook has ${size} spells, more than the ${expected} expected at your level.`;
};

/**
 * Totals the levels of the spells picked in the prepare dialog, to show
 * against the limit. A display helper: the API enforces the limit.
 */
export const totalSpellLevels = (
  spells: readonly { key: string; level: number }[],
  selected: readonly string[],
): number =>
  spells
    .filter((s) => selected.includes(s.key))
    .reduce((total, s) => total + s.level, 0);
