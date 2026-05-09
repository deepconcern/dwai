import { HttpLink } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/client-integration-nextjs";

export const { getClient, PreloadQuery, query } = registerApolloClient(
  () =>
    new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: new URL(
          "/graphql",
          process.env.NEXT_PUBLIC_GRAPHQL_URI,
        ).toString(),
      }),
    }),
);
