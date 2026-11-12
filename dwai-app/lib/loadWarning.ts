/**
 * Returns a warning when the character carries more than their max load (the
 * API computes both), or null. Being over is allowed: the Encumbrance move
 * says what happens.
 */
export const loadWarning = (load: number, maxLoad: number): string | null =>
  load > maxLoad
    ? `Over max load by ${load - maxLoad}. The Encumbrance move applies.`
    : null;
