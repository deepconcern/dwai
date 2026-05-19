import clsx from "clsx";
import { FC, useMemo } from "react";

import { FragmentType, useFragment } from "@/gql";
import { MoveFragment } from "@/fragments/MoveFragment";

import { List } from "./List";

export type MoveCardProps = {
  className?: string | null;
  move: FragmentType<typeof MoveFragment>;
};

export const MoveCard: FC<MoveCardProps> = ({
  className,
  move: moveFragment,
}) => {
  const move = useFragment(MoveFragment, moveFragment);

  const rollResults = useMemo(() => {
    if (!move.roll) return [];

    const results = [];
    if (move.on10) {
      results.push({ content: <>On a 10+: {move.on10}</>, key: "10+" });
    }
    if (move.on7to9) {
      results.push({ content: <>On a 7-9: {move.on7to9}</>, key: "7-9" });
    }
    if (move.onMiss) {
      results.push({ content: <>On a miss: {move.onMiss}</>, key: "miss" });
    }
    return results;
  }, [move]);

  return (
    <div className={clsx(className, "border p-4 rounded")}>
      <h4 className="font-medium">{move.name}</h4>
      <div className="flex flex-col gap-2 mt-2">
        {move.replacesKey && (
          <p className="text-sm text-gray-300">
            Replaces move: {move.replacesKey}
          </p>
        )}
        {move.requiresKey && (
          <p className="text-sm text-gray-300">
            Requires move: {move.requiresKey}
          </p>
        )}
        {move.trigger && (
          <p className="italic text-gray-300 text-sm">{move.trigger}...</p>
        )}
        {move.roll && (
          <>
            <p className="text-sm text-gray-300">On a roll of {move.roll}...</p>
            <List className="text-gray-300 text-sm" items={rollResults} />
          </>
        )}
        {move.description && (
          <p className="text-gray-300 text-sm">{move.description}</p>
        )}
        {move.options.length > 0 && (
          <div>
            <p className="text-sm text-gray-300">Options:</p>
            <List
              className="text-gray-300 text-sm"
              items={move.options.map((option, i) => ({
                content: option,
                key: i,
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
};
