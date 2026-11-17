import { HttpLink } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/client-integration-nextjs";
import { SetContextLink } from "@apollo/client/link/context";
import { cookies } from "next/headers";

import { apiGraphqlUrl } from "./apiUri";

/**
 * The Apollo client for server components. It calls the API directly and
 * forwards the incoming request's cookies, so queries run as the logged-in
 * user.
 */
export const { getClient, PreloadQuery, query } = registerApolloClient(
  () =>
    new ApolloClient({
      cache: new InMemoryCache(),
      link: new SetContextLink(async ({ headers }) => ({
        headers: { ...headers, cookie: (await cookies()).toString() },
      })).concat(new HttpLink({ uri: apiGraphqlUrl })),
    }),
);
