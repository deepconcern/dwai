import { AttributeType } from "../gql/graphql";

export function formatModName(attributeType: AttributeType) {
  return attributeType.slice(0, 3).toLocaleUpperCase();
}

export function formatModValue(modifier: number | string) {
  if (typeof modifier === "number" && modifier >= 0) return `+${modifier}`;
  return modifier.toString();
}
