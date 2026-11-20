import { notFound } from "next/navigation";
import { FC } from "react";

import { MonsterFragment } from "@/fragments/MonsterFragment";
import { graphql, unmaskFragment } from "@/gql";
import { query } from "@/lib/apollo-client";
import { requireUser } from "@/lib/session";

import { CustomMonsterView } from "./CustomMonsterView";

const GET_CUSTOM_MONSTER_QUERY = graphql(`
  query GetCustomMonster($id: ID!) {
    monsters {
      custom(id: $id) {
        ...MonsterFragment
      }
      tags
    }
  }
`);

export type CustomMonsterPageProps = {
  params: Promise<{ id: string }>;
};

/** One of the user's own monsters, to read, edit, or delete. */
export const CustomMonsterPage: FC<CustomMonsterPageProps> = async ({
  params,
}) => {
  const { id } = await params;
  await requireUser(`/monsters/custom/${id}`);

  const { data } = await query({
    errorPolicy: "all",
    fetchPolicy: "no-cache",
    query: GET_CUSTOM_MONSTER_QUERY,
    variables: { id },
  });
  if (!data?.monsters?.custom) notFound();

  return (
    <CustomMonsterView
      monster={unmaskFragment(MonsterFragment, data.monsters.custom)}
      tagSuggestions={data.monsters.tags}
    />
  );
};

export default CustomMonsterPage;
