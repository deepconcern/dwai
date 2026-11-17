/**
 * The API's origin, for server-side code only: the `/graphql` rewrite and
 * server-side queries. Browsers call the app's own `/graphql`, which Next.js
 * rewrites here, so the session cookie stays first-party.
 */
export const apiUri = process.env.API_URI || "http://localhost:5000";

/** The API's GraphQL endpoint (see {@link apiUri}). */
export const apiGraphqlUrl = new URL("/graphql", apiUri).toString();
