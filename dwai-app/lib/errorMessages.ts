import { CombinedGraphQLErrors } from "@apollo/client";

// errorMessages turns a failed request into messages to show the player. The
// API writes validation messages to be shown as-is.
export const errorMessages = (error: unknown): string[] =>
  CombinedGraphQLErrors.is(error)
    ? error.errors.map((e) => e.message)
    : [error instanceof Error ? error.message : String(error)];
