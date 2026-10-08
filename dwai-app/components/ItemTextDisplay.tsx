import { FC } from "react";

import { ItemOptionFragment } from "@/fragments/ItemOptionFragment";
import { FragmentType, unmaskFragment } from "@/gql";

export type ItemTextDisplayProps = {
  item: FragmentType<typeof ItemOptionFragment>;
};

export const ItemTextDisplay: FC<ItemTextDisplayProps> = ({ item: i }) => {
  const item = unmaskFragment(ItemOptionFragment, i);

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
