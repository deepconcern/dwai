import { FC, Suspense } from "react";

import { PreloadQuery } from "@/lib/apollo-client";
import { requireUser } from "@/lib/session";

import { GET_MONSTERS_QUERY } from "./GET_MONSTERS_QUERY";
import { MonstersPageClient } from "./MonstersPageClient";

export type MonstersPageProps = {
  searchParams: Promise<{ tab?: string | string[] }>;
};

/** Monsters: the SRD compendium and the user's own bestiary. */
export const MonstersPage: FC<MonstersPageProps> = async ({ searchParams }) => {
  await requireUser("/monsters");
  const { tab } = await searchParams;

  return (
    <PreloadQuery query={GET_MONSTERS_QUERY}>
      <Suspense fallback={<>Loading...</>}>
        <MonstersPageClient
          initialTab={tab === "mine" ? "mine" : "compendium"}
        />
      </Suspense>
    </PreloadQuery>
  );
};

export default MonstersPage;
