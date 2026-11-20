import { FC } from "react";

import { PageTitle } from "@/components/PageTitle";
import { MonsterFragment } from "@/fragments/MonsterFragment";
import { graphql, unmaskFragment } from "@/gql";
import { query } from "@/lib/apollo-client";
import { monsterFormState } from "@/lib/monsters";
import { requireUser } from "@/lib/session";

import { NewMonsterForm } from "./NewMonsterForm";

const GET_NEW_MONSTER_QUERY = graphql(`
  query GetNewMonster($from: ID!, $copying: Boolean!) {
    monsters {
      byKey(key: $from) @include(if: $copying) {
        ...MonsterFragment
      }
      tags
    }
  }
`);

export type NewMonsterPageProps = {
  searchParams: Promise<{ from?: string | string[] }>;
};

/**
 * Writes a custom monster from scratch, or (with `?from=<key>`) from a copy
 * of a compendium monster.
 */
export const NewMonsterPage: FC<NewMonsterPageProps> = async ({
  searchParams,
}) => {
  const { from } = await searchParams;
  const fromKey = typeof from === "string" ? from : "";
  await requireUser(
    fromKey
      ? `/monsters/new?from=${encodeURIComponent(fromKey)}`
      : "/monsters/new",
  );

  const { data } = await query({
    fetchPolicy: "no-cache",
    query: GET_NEW_MONSTER_QUERY,
    variables: { copying: fromKey !== "", from: fromKey },
  });
  const copy = data?.monsters.byKey
    ? unmaskFragment(MonsterFragment, data.monsters.byKey)
    : null;

  return (
    <div className="flex flex-col p-4 space-y-4">
      <PageTitle title={copy ? `Copy ${copy.name}` : "New Monster"} />
      {copy && (
        <p className="text-gray-400">
          Saving makes your own copy. Changing it won&apos;t change the
          compendium.
        </p>
      )}
      <NewMonsterForm
        initial={monsterFormState(copy)}
        tagSuggestions={data?.monsters.tags ?? []}
      />
    </div>
  );
};

export default NewMonsterPage;
