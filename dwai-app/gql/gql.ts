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
type Documents = {
    "\n  query GetCharacter($id: ID!) {\n    characters {\n      byId(id: $id) {\n        abilities {\n          ability\n          modifier\n          score\n        }\n        id\n        looks {\n          id\n          lookType {\n            key\n            name\n          }\n          value\n        }\n        name\n      }\n    }\n  }\n": typeof types.GetCharacterDocument,
    "\n  query GetCharacterClassesForCreate {\n    characterClasses {\n      all {\n        alignmentTemplates {\n          alignment\n          description\n        }\n        bonds\n        damageDie\n        hpBase\n        key\n        lookExamples {\n          examples\n          type\n        }\n        name\n        raceMoves {\n          key\n          ...MoveFragment\n        }\n        startingGear {\n          default {\n            ...GearItemFragment\n          }\n          loadBase\n          options {\n            pick\n            choices {\n              ...GearItemFragment\n            }\n          }\n        }\n        startingMoves {\n          key\n          ...MoveFragment\n        }\n      }\n    }\n    lookTypes {\n      all {\n        examples\n        key\n        name\n      }\n    }\n  }\n": typeof types.GetCharacterClassesForCreateDocument,
    "\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    characters {\n      create(input: $input) {\n        id\n        name\n      }\n    }\n  }\n": typeof types.CreateCharacterDocument,
    "\n  query GetCharacters {\n    characters {\n      all {\n        id\n        name\n      }\n    }\n  }\n": typeof types.GetCharactersDocument,
    "\n  fragment GearItemFragment on GearItem {\n    count\n    description\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n  }\n": typeof types.GearItemFragmentFragmentDoc,
    "\n  fragment MoveFragment on Move {\n    creationOptions {\n      choices {\n        key\n        label\n      }\n      label\n      pick\n    }\n    description\n    key\n    name\n    on10\n    on7to9\n    onMiss\n    options\n    replacesKey\n    requiresKey\n    roll\n    trigger\n    type\n  }\n": typeof types.MoveFragmentFragmentDoc,
};
const documents: Documents = {
    "\n  query GetCharacter($id: ID!) {\n    characters {\n      byId(id: $id) {\n        abilities {\n          ability\n          modifier\n          score\n        }\n        id\n        looks {\n          id\n          lookType {\n            key\n            name\n          }\n          value\n        }\n        name\n      }\n    }\n  }\n": types.GetCharacterDocument,
    "\n  query GetCharacterClassesForCreate {\n    characterClasses {\n      all {\n        alignmentTemplates {\n          alignment\n          description\n        }\n        bonds\n        damageDie\n        hpBase\n        key\n        lookExamples {\n          examples\n          type\n        }\n        name\n        raceMoves {\n          key\n          ...MoveFragment\n        }\n        startingGear {\n          default {\n            ...GearItemFragment\n          }\n          loadBase\n          options {\n            pick\n            choices {\n              ...GearItemFragment\n            }\n          }\n        }\n        startingMoves {\n          key\n          ...MoveFragment\n        }\n      }\n    }\n    lookTypes {\n      all {\n        examples\n        key\n        name\n      }\n    }\n  }\n": types.GetCharacterClassesForCreateDocument,
    "\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    characters {\n      create(input: $input) {\n        id\n        name\n      }\n    }\n  }\n": types.CreateCharacterDocument,
    "\n  query GetCharacters {\n    characters {\n      all {\n        id\n        name\n      }\n    }\n  }\n": types.GetCharactersDocument,
    "\n  fragment GearItemFragment on GearItem {\n    count\n    description\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n  }\n": types.GearItemFragmentFragmentDoc,
    "\n  fragment MoveFragment on Move {\n    creationOptions {\n      choices {\n        key\n        label\n      }\n      label\n      pick\n    }\n    description\n    key\n    name\n    on10\n    on7to9\n    onMiss\n    options\n    replacesKey\n    requiresKey\n    roll\n    trigger\n    type\n  }\n": types.MoveFragmentFragmentDoc,
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
export function graphql(source: "\n  query GetCharacter($id: ID!) {\n    characters {\n      byId(id: $id) {\n        abilities {\n          ability\n          modifier\n          score\n        }\n        id\n        looks {\n          id\n          lookType {\n            key\n            name\n          }\n          value\n        }\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacter($id: ID!) {\n    characters {\n      byId(id: $id) {\n        abilities {\n          ability\n          modifier\n          score\n        }\n        id\n        looks {\n          id\n          lookType {\n            key\n            name\n          }\n          value\n        }\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCharacterClassesForCreate {\n    characterClasses {\n      all {\n        alignmentTemplates {\n          alignment\n          description\n        }\n        bonds\n        damageDie\n        hpBase\n        key\n        lookExamples {\n          examples\n          type\n        }\n        name\n        raceMoves {\n          key\n          ...MoveFragment\n        }\n        startingGear {\n          default {\n            ...GearItemFragment\n          }\n          loadBase\n          options {\n            pick\n            choices {\n              ...GearItemFragment\n            }\n          }\n        }\n        startingMoves {\n          key\n          ...MoveFragment\n        }\n      }\n    }\n    lookTypes {\n      all {\n        examples\n        key\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacterClassesForCreate {\n    characterClasses {\n      all {\n        alignmentTemplates {\n          alignment\n          description\n        }\n        bonds\n        damageDie\n        hpBase\n        key\n        lookExamples {\n          examples\n          type\n        }\n        name\n        raceMoves {\n          key\n          ...MoveFragment\n        }\n        startingGear {\n          default {\n            ...GearItemFragment\n          }\n          loadBase\n          options {\n            pick\n            choices {\n              ...GearItemFragment\n            }\n          }\n        }\n        startingMoves {\n          key\n          ...MoveFragment\n        }\n      }\n    }\n    lookTypes {\n      all {\n        examples\n        key\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    characters {\n      create(input: $input) {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    characters {\n      create(input: $input) {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCharacters {\n    characters {\n      all {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacters {\n    characters {\n      all {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment GearItemFragment on GearItem {\n    count\n    description\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n  }\n"): (typeof documents)["\n  fragment GearItemFragment on GearItem {\n    count\n    description\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment MoveFragment on Move {\n    creationOptions {\n      choices {\n        key\n        label\n      }\n      label\n      pick\n    }\n    description\n    key\n    name\n    on10\n    on7to9\n    onMiss\n    options\n    replacesKey\n    requiresKey\n    roll\n    trigger\n    type\n  }\n"): (typeof documents)["\n  fragment MoveFragment on Move {\n    creationOptions {\n      choices {\n        key\n        label\n      }\n      label\n      pick\n    }\n    description\n    key\n    name\n    on10\n    on7to9\n    onMiss\n    options\n    replacesKey\n    requiresKey\n    roll\n    trigger\n    type\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;