import { FC } from "react";

import { MonsterFragmentFragment } from "@/gql/graphql";

export type MonsterStatBlockProps = {
  monster: MonsterFragmentFragment;
};

/**
 * A monster's stat block, as the rulebook prints it: tags, HP, armor, the
 * attack, then instinct, description, special qualities, and moves.
 * Missing fields are left out rather than shown as zero.
 */
export const MonsterStatBlock: FC<MonsterStatBlockProps> = ({ monster }) => {
  const { armor, attack, hp } = monster;

  return (
    <div className="flex flex-col gap-2">
      {monster.tags.length > 0 && (
        <p className="italic text-gray-300">{monster.tags.join(", ")}</p>
      )}
      {(hp != null || armor != null || attack) && (
        <dl className="flex flex-wrap gap-x-6 gap-y-1">
          {hp != null && (
            <div className="flex gap-1">
              <dt className="font-semibold">HP</dt>
              <dd>{hp}</dd>
            </div>
          )}
          {armor != null && (
            <div className="flex gap-1">
              <dt className="font-semibold">Armor</dt>
              <dd>{armor}</dd>
            </div>
          )}
          {attack && (
            <div className="flex gap-1">
              <dt className="font-semibold">Attack</dt>
              <dd>
                {attack.name} ({attack.damage} damage
                {attack.piercing > 0 && `, ${attack.piercing} piercing`}
                {attack.ignoresArmor && ", ignores armor"})
                {attack.tags.length > 0 && (
                  <span className="text-gray-300">
                    {" "}
                    · {attack.tags.join(", ")}
                  </span>
                )}
              </dd>
            </div>
          )}
        </dl>
      )}
      {monster.instinct && (
        <p>
          <span className="font-semibold">Instinct:</span> {monster.instinct}
        </p>
      )}
      {monster.description && (
        <p className="text-gray-300">{monster.description}</p>
      )}
      {monster.specialQualities.length > 0 && (
        <p>
          <span className="font-semibold">Special qualities:</span>{" "}
          {monster.specialQualities.join(", ")}
        </p>
      )}
      {monster.moves.length > 0 && (
        <div>
          <p className="font-semibold">Moves</p>
          <ul className="list-disc list-inside">
            {monster.moves.map((move) => (
              <li key={move}>{move}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
