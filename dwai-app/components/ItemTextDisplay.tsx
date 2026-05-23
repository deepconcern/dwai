import { FC } from "react";

import { GearItemFragment } from "@/fragments/GearItemFragment";
import { FragmentType, useFragment } from "@/gql";

export type ItemTextDisplayProps = {
  item: FragmentType<typeof GearItemFragment>;
};

export const ItemTextDisplay: FC<ItemTextDisplayProps> = ({ item: i }) => {
  const item = useFragment(GearItemFragment, i);

  let text = item.label;

  if (item.tags.length > 0) {
    text += " (";
    text += item.tags
      .map((tag) =>
        typeof tag.quantity === "number"
          ? `${tag.name} ${tag.quantity}`
          : tag.name,
      )
      .join(", ");
    text += ")";
  }

  return text;
};
