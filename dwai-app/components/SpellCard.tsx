import clsx from "clsx";
import { FC, ReactNode } from "react";

import { SpellFragment } from "@/fragments/SpellFragment";
import { FragmentType, unmaskFragment } from "@/gql";

import { List } from "./List";

export type SpellCardProps = {
  /** Controls shown beside the spell's name (e.g. a Remove button). */
  actions?: ReactNode;
  className?: string | null;
  spell: FragmentType<typeof SpellFragment>;
};

/** Shows a spell: name, level, tags, description, and any options. */
export const SpellCard: FC<SpellCardProps> = ({
  actions,
  className,
  spell: spellFragment,
}) => {
  const spell = unmaskFragment(SpellFragment, spellFragment);
  const details = [
    spell.level === 0 ? "Always prepared" : `Level ${spell.level}`,
    ...spell.tags,
  ];

  return (
    <article
      aria-label={spell.name}
      className={clsx(className, "bg-neutral-900 border p-4 rounded")}
    >
      <div className="flex gap-2 items-start justify-between">
        <div>
          <h4 className="font-medium">{spell.name}</h4>
          <p className="text-gray-400 text-sm">{details.join(" · ")}</p>
        </div>
        {actions}
      </div>
      <p className="mt-2 text-gray-300 text-sm">{spell.description}</p>
      {spell.options.length > 0 && (
        <List
          className="mt-2 text-gray-300 text-sm"
          items={spell.options.map((o) => ({ content: o, key: o }))}
        />
      )}
    </article>
  );
};
