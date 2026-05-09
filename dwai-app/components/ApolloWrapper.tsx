"use client";

import { HttpLink } from "@apollo/client";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { FC, PropsWithChildren } from "react";

function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: new URL("/graphql", process.env.NEXT_PUBLIC_GRAPHQL_URI).toString(),
    }),
  });
}

export const ApolloWrapper: FC<PropsWithChildren> = ({ children }) => (
  <ApolloNextAppProvider makeClient={makeClient}>
    {children}
  </ApolloNextAppProvider>
);
