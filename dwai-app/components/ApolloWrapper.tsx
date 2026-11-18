"use client";

import { ApolloLink, HttpLink } from "@apollo/client";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { OperationTypeNode } from "graphql";
import { createClient } from "graphql-ws";
import { FC, PropsWithChildren } from "react";

import { apiGraphqlUrl } from "@/lib/apiUri";
import { notifyReconnected } from "@/lib/reconnect";

/**
 * Where the browser opens the chat's WebSocket: the app's own `/graphql`,
 * which Next.js rewrites to the API (upgrades included), so the session
 * cookie goes along. `NEXT_PUBLIC_API_WS_URL` overrides it, for a proxy that
 * doesn't pass WebSockets through.
 */
const wsUrl = () =>
  process.env.NEXT_PUBLIC_API_WS_URL ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/graphql`;

/**
 * In the browser, queries and mutations go to the app's own `/graphql`,
 * which Next.js rewrites to the API, so the session cookie is sent and set
 * first-party; subscriptions (the table chat) go over a WebSocket to the
 * same place. During server rendering of client components there's no
 * browser cookie, so the API is called directly (game content is public;
 * character data is preloaded by server components, which forward the
 * cookie), and there are no subscriptions.
 */
const makeClient = () => {
  if (typeof window === "undefined") {
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({ uri: apiGraphqlUrl }),
    });
  }

  let connectedBefore = false;
  const wsLink = new GraphQLWsLink(
    createClient({
      on: {
        // After a dropped connection comes back, open chats reload what
        // they missed.
        connected: () => {
          if (connectedBefore) notifyReconnected();
          connectedBefore = true;
        },
      },
      retryAttempts: Infinity,
      shouldRetry: () => true,
      url: wsUrl(),
    }),
  );

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.split(
      ({ operationType }) => operationType === OperationTypeNode.SUBSCRIPTION,
      wsLink,
      new HttpLink({ uri: "/graphql" }),
    ),
  });
};

/** Provides the browser's Apollo client to client components. */
export const ApolloWrapper: FC<PropsWithChildren> = ({ children }) => (
  <ApolloNextAppProvider makeClient={makeClient}>
    {children}
  </ApolloNextAppProvider>
);
