import { ApolloClient, InMemoryCache } from "@apollo/client";

let client: ApolloClient<any> | null = null;

export function getApolloClient(): ApolloClient<any> {
    if (client === null ) {
        client = new ApolloClient<any>({
            cache: new InMemoryCache(),
            uri: `${import.meta.env.VITE_GRAPHQL_URI}/graphql`,
        });
    }

    return client!;
}