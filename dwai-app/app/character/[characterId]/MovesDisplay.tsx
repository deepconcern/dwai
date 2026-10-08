import { FC } from "react";

import { MoveCard } from "@/components/MoveCard";
import { MoveFragment } from "@/fragments/MoveFragment";
import { FragmentType, unmaskFragment } from "@/gql";

export type MovesDisplayProps = {
  moves: FragmentType<typeof MoveFragment>[];
};

export const MovesDisplay: FC<MovesDisplayProps> = ({ moves }) => (
  <div className="grid grid-cols-2 gap-4">
    {moves.map((m) => {
      const { key } = unmaskFragment(MoveFragment, m);

      return <MoveCard key={key} move={m} />;
    })}
  </div>
);
