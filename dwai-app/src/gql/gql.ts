/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "query GetCharacter($characterId: ID!) {\n    characters {\n        byId(id: $characterId) {\n            id\n            name\n        }\n    }\n}": types.GetCharacterDocument,
    "mutation CreateCharacter($input: NewCharacterInput!) {\n    characters {\n        create(input: $input) {\n            id\n            name\n        }\n    }\n}": types.CreateCharacterDocument,
    "query GetCharacterClasses {\n    characterClasses {\n        all {\n            alignmentMoves {\n                key\n                name\n                text\n                type\n            }\n            damageDie\n            hpBase\n            key\n            name\n            raceMoves {\n                key\n                name\n                text\n                type\n            }\n            startingMoves {\n                key\n                name\n                text\n                type\n            }\n        }\n    }\n}": types.GetCharacterClassesDocument,
    "query GetLookTypes {\n    lookTypes {\n        all {\n            examples\n            key\n            name\n        }\n    }\n}": types.GetLookTypesDocument,
    "query GetMoves {\n    moves {\n        all {\n            key\n            name\n            text\n            type\n        }\n    }\n}": types.GetMovesDocument,
    "mutation CreateGame($characterId: String!, $name: String!, $scenarioKey: String!) {\n    games {\n        create(characterId: $characterId, name: $name, scenarioKey: $scenarioKey) {\n            id\n            name\n        }\n    }\n}": types.CreateGameDocument,
    "query GetScenarios {\n    scenarios {\n        all {\n            description\n            key\n            name\n        }\n    }\n}": types.GetScenariosDocument,
    "query GetMessages {\n    messages {\n        all {\n            author\n            content\n            datetime\n            id\n        }\n    }\n}": types.GetMessagesDocument,
    "mutation SendMessage($content: String!) {\n    messages {\n        send(content: $content) {\n            author\n            content\n            datetime\n            id\n        }\n    }\n}": types.SendMessageDocument,
    "query GetGames {\n    games {\n        all {\n            id\n            name\n        }\n    }\n}": types.GetGamesDocument,
    "query GetCharacters {\n    characters {\n        all {\n            id\n            name\n        }\n    }\n}": types.GetCharactersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetCharacter($characterId: ID!) {\n    characters {\n        byId(id: $characterId) {\n            id\n            name\n        }\n    }\n}"): (typeof documents)["query GetCharacter($characterId: ID!) {\n    characters {\n        byId(id: $characterId) {\n            id\n            name\n        }\n    }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateCharacter($input: NewCharacterInput!) {\n    characters {\n        create(input: $input) {\n            id\n            name\n        }\n    }\n}"): (typeof documents)["mutation CreateCharacter($input: NewCharacterInput!) {\n    characters {\n        create(input: $input) {\n            id\n            name\n        }\n    }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetCharacterClasses {\n    characterClasses {\n        all {\n            alignmentMoves {\n                key\n                name\n                text\n                type\n            }\n            damageDie\n            hpBase\n            key\n            name\n            raceMoves {\n                key\n                name\n                text\n                type\n            }\n            startingMoves {\n                key\n                name\n                text\n                type\n            }\n        }\n    }\n}"): (typeof documents)["query GetCharacterClasses {\n    characterClasses {\n        all {\n            alignmentMoves {\n                key\n                name\n                text\n                type\n            }\n            damageDie\n            hpBase\n            key\n            name\n            raceMoves {\n                key\n                name\n                text\n                type\n            }\n            startingMoves {\n                key\n                name\n                text\n                type\n            }\n        }\n    }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetLookTypes {\n    lookTypes {\n        all {\n            examples\n            key\n            name\n        }\n    }\n}"): (typeof documents)["query GetLookTypes {\n    lookTypes {\n        all {\n            examples\n            key\n            name\n        }\n    }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetMoves {\n    moves {\n        all {\n            key\n            name\n            text\n            type\n        }\n    }\n}"): (typeof documents)["query GetMoves {\n    moves {\n        all {\n            key\n            name\n            text\n            type\n        }\n    }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateGame($characterId: String!, $name: String!, $scenarioKey: String!) {\n    games {\n        create(characterId: $characterId, name: $name, scenarioKey: $scenarioKey) {\n            id\n            name\n        }\n    }\n}"): (typeof documents)["mutation CreateGame($characterId: String!, $name: String!, $scenarioKey: String!) {\n    games {\n        create(characterId: $characterId, name: $name, scenarioKey: $scenarioKey) {\n            id\n            name\n        }\n    }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetScenarios {\n    scenarios {\n        all {\n            description\n            key\n            name\n        }\n    }\n}"): (typeof documents)["query GetScenarios {\n    scenarios {\n        all {\n            description\n            key\n            name\n        }\n    }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetMessages {\n    messages {\n        all {\n            author\n            content\n            datetime\n            id\n        }\n    }\n}"): (typeof documents)["query GetMessages {\n    messages {\n        all {\n            author\n            content\n            datetime\n            id\n        }\n    }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SendMessage($content: String!) {\n    messages {\n        send(content: $content) {\n            author\n            content\n            datetime\n            id\n        }\n    }\n}"): (typeof documents)["mutation SendMessage($content: String!) {\n    messages {\n        send(content: $content) {\n            author\n            content\n            datetime\n            id\n        }\n    }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetGames {\n    games {\n        all {\n            id\n            name\n        }\n    }\n}"): (typeof documents)["query GetGames {\n    games {\n        all {\n            id\n            name\n        }\n    }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetCharacters {\n    characters {\n        all {\n            id\n            name\n        }\n    }\n}"): (typeof documents)["query GetCharacters {\n    characters {\n        all {\n            id\n            name\n        }\n    }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;