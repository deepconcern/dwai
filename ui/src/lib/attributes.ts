import { AttributeType } from "../gql/graphql";

export const ATTRIBUTES: AttributeType[] = [
  AttributeType.Strength,
  AttributeType.Dexterity,
  AttributeType.Constitution,
  AttributeType.Intelligence,
  AttributeType.Wisdom,
  AttributeType.Charisma,
];

export const STANDARD_ARRAY = [16, 15, 13, 12, 9, 8];

export function getModifier(score: number): number {
  if (score >= 16) return 2
  if (score >= 13) return 1
  if (score >= 9) return 0
  return -1
}