"use client";

import { HttpLink } from "@apollo/client";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { FC, PropsWithChildren } from "react";

import { apiGraphqlUrl } from "@/lib/apiUri";

/**
 * In the browser, requests go to the app's own `/graphql`, which Next.js
 * rewrites to the API, so the session cookie is sent and set first-party.
 * During server rendering of client components there's no browser cookie,
 * so the API is called directly (game content is public; character data is
 * preloaded by server components, which forward the cookie).
 */
const makeClient = () =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: typeof window === "undefined" ? apiGraphqlUrl : "/graphql",
    }),
  });

/** Provides the browser's Apollo client to client components. */
export const ApolloWrapper: FC<PropsWithChildren> = ({ children }) => (
  <ApolloNextAppProvider makeClient={makeClient}>
    {children}
  </ApolloNextAppProvider>
);
