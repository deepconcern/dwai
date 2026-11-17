import { redirect } from "next/navigation";
import { cache } from "react";

import { graphql } from "@/gql";
import { MeQuery } from "@/gql/graphql";

import { query } from "./apollo-client";
import { loginHref } from "./safeNext";

const ME_QUERY = graphql(`
  query Me {
    me {
      displayName
      email
      id
    }
  }
`);

/** The logged-in user. */
export type User = NonNullable<MeQuery["me"]>;

/**
 * Returns the logged-in user, or null, asking the API (the cookie alone
 * proves nothing: it may have expired or been logged out). Cached for the
 * request, so the layout and page share one query. Server components only.
 */
export const getUser = cache(async (): Promise<User | null> => {
  const { data } = await query({ fetchPolicy: "no-cache", query: ME_QUERY });

  return data?.me ?? null;
});

/**
 * Returns the logged-in user, or redirects to the login page, which returns
 * to `path` afterwards. `proxy.ts` already redirects when there's no cookie
 * at all; this catches a cookie the API no longer accepts. Server components
 * only.
 */
export const requireUser = async (path: string): Promise<User> => {
  const user = await getUser();
  if (!user) redirect(loginHref(path));

  return user;
};
