/**
 * Replaces the blank in a class's bond template (a run of underscores) with
 * the target character's name. The API stores whatever text the player
 * ends up with; this only gives them a starting point.
 */
export const fillBondTemplate = (template: string, name: string): string =>
  template.replace(/_{2,}/g, name);

/** An End of Session checkbox and the reason written for it. */
export type CheckedReason = {
  checked: boolean;
  reason: string;
};

/**
 * Whether a checkbox is checked without a reason. The API rejects these;
 * the dialogs use this to explain why they can't submit yet.
 */
export const needsReason = ({ checked, reason }: CheckedReason): boolean =>
  checked && reason.trim() === "";

/**
 * The XP a report will mark, as a preview: 1 per group question answered
 * "yes", 1 for a fulfilled alignment, and 1 for a resolved bond. The API
 * computes the real award.
 */
export const endOfSessionXp = (
  groupYes: number,
  alignmentFulfilled: boolean,
  bondResolved: boolean,
): number => groupYes + Number(alignmentFulfilled) + Number(bondResolved);
