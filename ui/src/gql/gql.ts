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
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    "\n  query GetCharacterClass($id: ID!) {\n    characterClass {\n      byId(id: $id) {\n        id\n        name\n      }\n    }\n  }\n": types.GetCharacterClassDocument,
    "\n  query GetCharacter($id: ID!) {\n    character {\n      byId(id: $id) {\n        id\n        name\n      }\n    }\n  }\n": types.GetCharacterDocument,
    "\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    character {\n      create(input: $input) {\n        characterClass {\n          id\n          name\n        }\n        id\n        name\n      }\n    }\n  }\n": types.CreateCharacterDocument,
    "\n  query GetCharacterClasses {\n    characterClass {\n      all {\n        id\n        name\n      }\n    }\n  }\n": types.GetCharacterClassesDocument,
    "\n  query HomePage {\n    character {\n      all {\n        characterClass {\n          id\n          name\n        }\n        id\n        name\n      }\n    }\n    characterClass {\n      all {\n        id\n        name\n      }\n    }\n  }\n": types.HomePageDocument,
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
export function graphql(source: "\n  query GetCharacterClass($id: ID!) {\n    characterClass {\n      byId(id: $id) {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacterClass($id: ID!) {\n    characterClass {\n      byId(id: $id) {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCharacter($id: ID!) {\n    character {\n      byId(id: $id) {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacter($id: ID!) {\n    character {\n      byId(id: $id) {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    character {\n      create(input: $input) {\n        characterClass {\n          id\n          name\n        }\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    character {\n      create(input: $input) {\n        characterClass {\n          id\n          name\n        }\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCharacterClasses {\n    characterClass {\n      all {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacterClasses {\n    characterClass {\n      all {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query HomePage {\n    character {\n      all {\n        characterClass {\n          id\n          name\n        }\n        id\n        name\n      }\n    }\n    characterClass {\n      all {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query HomePage {\n    character {\n      all {\n        characterClass {\n          id\n          name\n        }\n        id\n        name\n      }\n    }\n    characterClass {\n      all {\n        id\n        name\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;