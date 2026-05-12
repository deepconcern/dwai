import { FC } from "react";

import { FragmentType, useFragment } from "@/gql";
import { MoveFragment } from "@/lib/MoveFragment";
import clsx from "clsx";

export type MoveCardProps = {
  className?: string | null;
  move: FragmentType<typeof MoveFragment>;
};

export const MoveCard: FC<MoveCardProps> = ({
  className,
  move: moveFragment,
}) => {
  const move = useFragment(MoveFragment, moveFragment);

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
            <ul className="list-disc list-inside text-sm text-gray-300">
              {move.on10 && <li>On a 10+: {move.on10}</li>}
              {move.on7to9 && <li>On a 7-9: {move.on7to9}</li>}
              {move.onMiss && <li>On a miss: {move.onMiss}</li>}
            </ul>
          </>
        )}
        {move.description && (
          <p className="text-gray-300 text-sm">{move.description}</p>
        )}
        {move.options.length > 0 && (
          <div>
            <p className="text-sm text-gray-300">Options:</p>
            <ul className="list-disc list-inside text-sm text-gray-300">
              {move.options.map((option, i) => (
                <li key={i}>{option}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
