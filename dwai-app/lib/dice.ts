/**
 * Dice for the roll and damage dialogs. When the player picks "Roll for me",
 * the browser rolls here and sends each die to the API, which records them
 * and adds up the total. (The table is an honor system: the player may roll
 * physical dice and enter the total instead.)
 */

/** One rolled die, in the shape the API's `DieInput` takes. */
export type RolledDie = {
  /** Shown but not counted, like the lower die of a best-of roll. */
  dropped: boolean;
  sides: number;
  value: number;
};

/** A value added to a roll, in the shape the API's `ModifierInput` takes. */
export type RollModifier = {
  label: string;
  value: number;
};

/** Returns a random face of a die: 1 to `sides`. */
export type DieRoller = (sides: number) => number;

/** The dice the API accepts in a damage roll. */
export const DAMAGE_DICE = [4, 6, 8, 10, 12, 20];

/** The most dice the API accepts in one damage roll. */
export const MAX_DAMAGE_DICE = 10;

/** Rolls one die fairly, with the browser's cryptographic randomness. */
export const rollDie: DieRoller = (sides) => {
  // Rejection sampling, so every face is equally likely.
  const limit = Math.floor(2 ** 32 / sides) * sides;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);

  return (buffer[0] % sides) + 1;
};

/** Rolls 2d6 for a move. */
export const rollMove = (roll: DieRoller = rollDie): RolledDie[] => [
  { dropped: false, sides: 6, value: roll(6) },
  { dropped: false, sides: 6, value: roll(6) },
];

/** One term of a damage expression: some dice, or a flat number. */
export type DamageTerm =
  | {
      count: number;
      /** Which dice count: all of them, or only the best or worst one. */
      keep: "all" | "best" | "worst";
      sides: number;
      type: "dice";
    }
  | { type: "flat"; value: number };

/** The result of parsing a damage expression. */
export type ParsedDamage =
  { error: string; ok: false } | { ok: true; terms: DamageTerm[] };

const TERM =
  /^\s*([+-])?\s*(?:([bw])\[(\d*)d(\d+)\]|(\d*)d(\d+)|(\d+))\s*(?=[+-]|$)/i;

/**
 * Parses a damage expression such as `d10`, `d8+1d4+2`, `d6-1`, `b[2d8]`
 * (best of two d8), or `w[2d8]` (worst of two).
 */
export const parseDamage = (expression: string): ParsedDamage => {
  const terms: DamageTerm[] = [];
  let rest = expression.trim();
  let diceCount = 0;

  if (rest === "") return { error: "Enter the damage dice.", ok: false };

  while (rest !== "") {
    const match = TERM.exec(rest);
    if (!match) {
      return {
        error: `"${expression}" isn't a damage expression like d8+1d4+2 or b[2d8].`,
        ok: false,
      };
    }

    const [whole, sign, keep, keepCount, keepSides, count, sides, flat] = match;
    rest = rest.slice(whole.length);

    if (flat !== undefined) {
      const value = Number(flat);
      terms.push({ type: "flat", value: sign === "-" ? -value : value });
      continue;
    }

    if (sign === "-") {
      return { error: "Dice can't be subtracted.", ok: false };
    }

    const term: DamageTerm = {
      count: Number((keep ? keepCount : count) || 1),
      keep: keep ? (keep.toLowerCase() === "b" ? "best" : "worst") : "all",
      sides: Number(keep ? keepSides : sides),
      type: "dice",
    };
    if (!DAMAGE_DICE.includes(term.sides)) {
      return {
        error: `d${term.sides} isn't one of ${DAMAGE_DICE.map((d) => `d${d}`).join(", ")}.`,
        ok: false,
      };
    }

    diceCount += term.count;
    terms.push(term);
  }

  if (diceCount > MAX_DAMAGE_DICE) {
    return { error: `Roll at most ${MAX_DAMAGE_DICE} dice.`, ok: false };
  }

  return { ok: true, terms };
};

/**
 * Rolls a parsed damage expression. Each die is returned (with the ones a
 * best-of or worst-of roll drops marked), and flat terms become modifiers.
 */
export const rollDamage = (
  terms: DamageTerm[],
  roll: DieRoller = rollDie,
): { dice: RolledDie[]; modifiers: RollModifier[] } => {
  const dice: RolledDie[] = [];
  const modifiers: RollModifier[] = [];

  for (const term of terms) {
    if (term.type === "flat") {
      modifiers.push({
        label: term.value < 0 ? `${term.value}` : `+${term.value}`,
        value: term.value,
      });
      continue;
    }

    const rolled = Array.from({ length: term.count }, () => ({
      dropped: false,
      sides: term.sides,
      value: roll(term.sides),
    }));

    if (term.keep !== "all") {
      const values = rolled.map((d) => d.value);
      const kept =
        term.keep === "best" ? Math.max(...values) : Math.min(...values);
      const keptIndex = values.indexOf(kept);
      rolled.forEach((d, i) => (d.dropped = i !== keptIndex));
    }

    dice.push(...rolled);
  }

  return { dice, modifiers };
};
