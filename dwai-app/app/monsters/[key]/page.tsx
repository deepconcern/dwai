import Link from "next/link";
import { notFound } from "next/navigation";
import { FC } from "react";

import { ButtonLink } from "@/components/ButtonLink";
import { MonsterStatBlock } from "@/components/MonsterStatBlock";
import { PageTitle } from "@/components/PageTitle";
import { MonsterFragment } from "@/fragments/MonsterFragment";
import { graphql, unmaskFragment } from "@/gql";
import { query } from "@/lib/apollo-client";
import { requireUser } from "@/lib/session";

const GET_COMPENDIUM_MONSTER_QUERY = graphql(`
  query GetCompendiumMonster($key: ID!) {
    monsters {
      byKey(key: $key) {
        ...MonsterFragment
      }
    }
  }
`);

export type CompendiumMonsterPageProps = {
  params: Promise<{ key: string }>;
};

/** A compendium monster's stat block, with a way to copy it to the bestiary. */
export const CompendiumMonsterPage: FC<CompendiumMonsterPageProps> = async ({
  params,
}) => {
  const { key } = await params;
  await requireUser(`/monsters/${key}`);

  const { data } = await query({
    query: GET_COMPENDIUM_MONSTER_QUERY,
    variables: { key },
  });
  if (!data?.monsters.byKey) notFound();

  const monster = unmaskFragment(MonsterFragment, data.monsters.byKey);

  return (
    <div className="flex flex-col p-4 space-y-4">
      <PageTitle title={monster.name} />
      {monster.setting && (
        <p className="text-gray-400">{monster.setting.name}</p>
      )}
      <MonsterStatBlock monster={monster} />
      <div className="flex gap-2">
        <ButtonLink href={`/monsters/new?from=${monster.id}`}>
          Copy to My Monsters
        </ButtonLink>
        <Link className="hover:underline py-2" href="/monsters">
          Back to Monsters
        </Link>
      </div>
    </div>
  );
};

export default CompendiumMonsterPage;
