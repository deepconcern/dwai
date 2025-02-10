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
    "\n  mutation UpdateCoin($input: UpdateCoinInput!) {\n    character {\n      updateCoin(input: $input) {\n        coin\n        id\n      }\n    }\n  }\n": types.UpdateCoinDocument,
    "\n  mutation UpdateAmmo($input: UpdateAmmoInput!) {\n    inventoryItem {\n      updateAmmo(input: $input) {\n        ...FullInventoryItem\n      }\n    }\n  }\n": types.UpdateAmmoDocument,
    "\n  query GetCharacterClass($id: ID!) {\n    characterClass {\n      byId(id: $id) {\n        damageDie\n        hpBase\n        id\n        name\n      }\n    }\n  }\n": types.GetCharacterClassDocument,
    "\n  query GetMoves {\n    damageAddition {\n      all {\n        id\n        name\n        value\n      }\n    }\n    forward {\n      all {\n        id\n        name\n        value\n      }\n    }\n    moveTemplate {\n      basic: byType(type: \"basic\") {\n        ... on MoveTemplate {\n          ...FullMoveTemplate\n        }\n      }\n      special: byType(type: \"special\") {\n        ... on MoveTemplate {\n          ...FullMoveTemplate\n        }\n      }\n    }\n  }\n": types.GetMovesDocument,
    "\n  mutation MarkXp($id: ID!) {\n    character {\n      markXp(id: $id)\n    }\n  }\n": types.MarkXpDocument,
    "\n  mutation UpdateHp($input: UpdateHpInput!) {\n    character {\n      updateHp(input: $input) {\n        id\n        currentHp\n      }\n    }\n  }\n": types.UpdateHpDocument,
    "\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    character {\n      create(input: $input) {\n        characterClass {\n          id\n          name\n        }\n        id\n        name\n      }\n    }\n  }\n": types.CreateCharacterDocument,
    "\n  query HomePage {\n    character {\n      all {\n        characterClass {\n          id\n          name\n        }\n        id\n        name\n      }\n    }\n  }\n": types.HomePageDocument,
    "\n  fragment FullCharacter on Character {\n    alignment {\n      id\n      name\n      text\n    }\n    armor\n    attributes {\n      modifier\n      type\n      score\n    }\n    bonds {\n      id\n      target {\n        ...ShortCharacter\n      }\n      text\n    }\n    bondScores {\n      id\n      score\n      target {\n        ...ShortCharacter\n      }\n    }\n    characterClass {\n      damageDie\n      id\n      name\n    }\n    classMoves {\n      ... on CharacterMove {\n        ...FullCharacterMove\n      }\n    }\n    coin\n    currentHp\n    id\n    inventoryItems {\n      ...FullInventoryItem\n    }\n    level\n    looks {\n      id\n      lookTarget {\n        id\n        name\n      }\n      text\n    }\n    maxHp\n    maxWeight\n    name\n    partyMembers {\n      ...ShortCharacter\n    }\n    raceMove {\n      ... on CharacterMove {\n        ...FullCharacterMove\n      }\n    }\n    weight\n    xp\n  }\n": types.FullCharacterFragmentDoc,
    "\n  fragment FullCharacterClass on CharacterClass {\n    alignmentTemplates {\n      id\n      name\n      text\n    }\n    damageDie\n    defaultStartingMoves {\n      ...ShortMoveTemplate\n    }\n    hpBase\n    id\n    name\n    pickableStartingMoves {\n      ...ShortMoveTemplate\n    }\n    raceMoves {\n      ...ShortMoveTemplate\n    }\n    weightBase\n  }\n": types.FullCharacterClassFragmentDoc,
    "\n  fragment FullCharacterMove on CharacterMove {\n    diceOverrides {\n      id\n      name\n      value\n    }\n    id\n    forwards {\n      id\n      name\n      value\n    }\n    moveOptions {\n      id\n      value\n    }\n    name\n    ongoings {\n      id\n      name\n      value\n    }\n    roll\n    text\n  }\n": types.FullCharacterMoveFragmentDoc,
    "\n  fragment FullInventoryItem on InventoryItem {\n    ammo\n    armor\n    cost\n    extraArmor\n    id\n    isDisabled\n    isWorn\n    location\n    name\n    tags\n    type\n    weight\n  }\n": types.FullInventoryItemFragmentDoc,
    "\n  fragment FullMoveTemplate on MoveTemplate {\n    diceOverrides {\n      id\n      name\n      value\n    }\n    id\n    forwards {\n      id\n      name\n      value\n    }\n    moveOptions {\n      id\n      value\n    }\n    name\n    ongoings {\n      id\n      name\n      value\n    }\n    roll\n    text\n  }\n": types.FullMoveTemplateFragmentDoc,
    "\n  query GetCharacterClasses {\n    characterClass {\n      all {\n        ...FullCharacterClass\n      }\n    }\n  }\n": types.GetCharacterClassesDocument,
    "\n  query GetCharacter($id: ID!) {\n    character {\n      byId(id: $id) {\n        ...FullCharacter\n      }\n    }\n  }\n": types.GetCharacterDocument,
    "\n  fragment ShortCharacter on Character {\n    id\n    name\n  }\n": types.ShortCharacterFragmentDoc,
    "\n  fragment ShortMoveTemplate on MoveTemplate {\n    id\n    isPickable\n    name\n    text\n  }\n": types.ShortMoveTemplateFragmentDoc,
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
export function graphql(source: "\n  mutation UpdateCoin($input: UpdateCoinInput!) {\n    character {\n      updateCoin(input: $input) {\n        coin\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateCoin($input: UpdateCoinInput!) {\n    character {\n      updateCoin(input: $input) {\n        coin\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateAmmo($input: UpdateAmmoInput!) {\n    inventoryItem {\n      updateAmmo(input: $input) {\n        ...FullInventoryItem\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateAmmo($input: UpdateAmmoInput!) {\n    inventoryItem {\n      updateAmmo(input: $input) {\n        ...FullInventoryItem\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCharacterClass($id: ID!) {\n    characterClass {\n      byId(id: $id) {\n        damageDie\n        hpBase\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacterClass($id: ID!) {\n    characterClass {\n      byId(id: $id) {\n        damageDie\n        hpBase\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMoves {\n    damageAddition {\n      all {\n        id\n        name\n        value\n      }\n    }\n    forward {\n      all {\n        id\n        name\n        value\n      }\n    }\n    moveTemplate {\n      basic: byType(type: \"basic\") {\n        ... on MoveTemplate {\n          ...FullMoveTemplate\n        }\n      }\n      special: byType(type: \"special\") {\n        ... on MoveTemplate {\n          ...FullMoveTemplate\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMoves {\n    damageAddition {\n      all {\n        id\n        name\n        value\n      }\n    }\n    forward {\n      all {\n        id\n        name\n        value\n      }\n    }\n    moveTemplate {\n      basic: byType(type: \"basic\") {\n        ... on MoveTemplate {\n          ...FullMoveTemplate\n        }\n      }\n      special: byType(type: \"special\") {\n        ... on MoveTemplate {\n          ...FullMoveTemplate\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkXp($id: ID!) {\n    character {\n      markXp(id: $id)\n    }\n  }\n"): (typeof documents)["\n  mutation MarkXp($id: ID!) {\n    character {\n      markXp(id: $id)\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateHp($input: UpdateHpInput!) {\n    character {\n      updateHp(input: $input) {\n        id\n        currentHp\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateHp($input: UpdateHpInput!) {\n    character {\n      updateHp(input: $input) {\n        id\n        currentHp\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    character {\n      create(input: $input) {\n        characterClass {\n          id\n          name\n        }\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    character {\n      create(input: $input) {\n        characterClass {\n          id\n          name\n        }\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query HomePage {\n    character {\n      all {\n        characterClass {\n          id\n          name\n        }\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query HomePage {\n    character {\n      all {\n        characterClass {\n          id\n          name\n        }\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment FullCharacter on Character {\n    alignment {\n      id\n      name\n      text\n    }\n    armor\n    attributes {\n      modifier\n      type\n      score\n    }\n    bonds {\n      id\n      target {\n        ...ShortCharacter\n      }\n      text\n    }\n    bondScores {\n      id\n      score\n      target {\n        ...ShortCharacter\n      }\n    }\n    characterClass {\n      damageDie\n      id\n      name\n    }\n    classMoves {\n      ... on CharacterMove {\n        ...FullCharacterMove\n      }\n    }\n    coin\n    currentHp\n    id\n    inventoryItems {\n      ...FullInventoryItem\n    }\n    level\n    looks {\n      id\n      lookTarget {\n        id\n        name\n      }\n      text\n    }\n    maxHp\n    maxWeight\n    name\n    partyMembers {\n      ...ShortCharacter\n    }\n    raceMove {\n      ... on CharacterMove {\n        ...FullCharacterMove\n      }\n    }\n    weight\n    xp\n  }\n"): (typeof documents)["\n  fragment FullCharacter on Character {\n    alignment {\n      id\n      name\n      text\n    }\n    armor\n    attributes {\n      modifier\n      type\n      score\n    }\n    bonds {\n      id\n      target {\n        ...ShortCharacter\n      }\n      text\n    }\n    bondScores {\n      id\n      score\n      target {\n        ...ShortCharacter\n      }\n    }\n    characterClass {\n      damageDie\n      id\n      name\n    }\n    classMoves {\n      ... on CharacterMove {\n        ...FullCharacterMove\n      }\n    }\n    coin\n    currentHp\n    id\n    inventoryItems {\n      ...FullInventoryItem\n    }\n    level\n    looks {\n      id\n      lookTarget {\n        id\n        name\n      }\n      text\n    }\n    maxHp\n    maxWeight\n    name\n    partyMembers {\n      ...ShortCharacter\n    }\n    raceMove {\n      ... on CharacterMove {\n        ...FullCharacterMove\n      }\n    }\n    weight\n    xp\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment FullCharacterClass on CharacterClass {\n    alignmentTemplates {\n      id\n      name\n      text\n    }\n    damageDie\n    defaultStartingMoves {\n      ...ShortMoveTemplate\n    }\n    hpBase\n    id\n    name\n    pickableStartingMoves {\n      ...ShortMoveTemplate\n    }\n    raceMoves {\n      ...ShortMoveTemplate\n    }\n    weightBase\n  }\n"): (typeof documents)["\n  fragment FullCharacterClass on CharacterClass {\n    alignmentTemplates {\n      id\n      name\n      text\n    }\n    damageDie\n    defaultStartingMoves {\n      ...ShortMoveTemplate\n    }\n    hpBase\n    id\n    name\n    pickableStartingMoves {\n      ...ShortMoveTemplate\n    }\n    raceMoves {\n      ...ShortMoveTemplate\n    }\n    weightBase\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment FullCharacterMove on CharacterMove {\n    diceOverrides {\n      id\n      name\n      value\n    }\n    id\n    forwards {\n      id\n      name\n      value\n    }\n    moveOptions {\n      id\n      value\n    }\n    name\n    ongoings {\n      id\n      name\n      value\n    }\n    roll\n    text\n  }\n"): (typeof documents)["\n  fragment FullCharacterMove on CharacterMove {\n    diceOverrides {\n      id\n      name\n      value\n    }\n    id\n    forwards {\n      id\n      name\n      value\n    }\n    moveOptions {\n      id\n      value\n    }\n    name\n    ongoings {\n      id\n      name\n      value\n    }\n    roll\n    text\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment FullInventoryItem on InventoryItem {\n    ammo\n    armor\n    cost\n    extraArmor\n    id\n    isDisabled\n    isWorn\n    location\n    name\n    tags\n    type\n    weight\n  }\n"): (typeof documents)["\n  fragment FullInventoryItem on InventoryItem {\n    ammo\n    armor\n    cost\n    extraArmor\n    id\n    isDisabled\n    isWorn\n    location\n    name\n    tags\n    type\n    weight\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment FullMoveTemplate on MoveTemplate {\n    diceOverrides {\n      id\n      name\n      value\n    }\n    id\n    forwards {\n      id\n      name\n      value\n    }\n    moveOptions {\n      id\n      value\n    }\n    name\n    ongoings {\n      id\n      name\n      value\n    }\n    roll\n    text\n  }\n"): (typeof documents)["\n  fragment FullMoveTemplate on MoveTemplate {\n    diceOverrides {\n      id\n      name\n      value\n    }\n    id\n    forwards {\n      id\n      name\n      value\n    }\n    moveOptions {\n      id\n      value\n    }\n    name\n    ongoings {\n      id\n      name\n      value\n    }\n    roll\n    text\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCharacterClasses {\n    characterClass {\n      all {\n        ...FullCharacterClass\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacterClasses {\n    characterClass {\n      all {\n        ...FullCharacterClass\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCharacter($id: ID!) {\n    character {\n      byId(id: $id) {\n        ...FullCharacter\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacter($id: ID!) {\n    character {\n      byId(id: $id) {\n        ...FullCharacter\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ShortCharacter on Character {\n    id\n    name\n  }\n"): (typeof documents)["\n  fragment ShortCharacter on Character {\n    id\n    name\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ShortMoveTemplate on MoveTemplate {\n    id\n    isPickable\n    name\n    text\n  }\n"): (typeof documents)["\n  fragment ShortMoveTemplate on MoveTemplate {\n    id\n    isPickable\n    name\n    text\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;