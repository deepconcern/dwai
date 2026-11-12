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
    "\n  mutation SetDebility($active: Boolean!, $debility: Debility!, $id: ID!) {\n    characters {\n      setDebility(active: $active, debility: $debility, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.SetDebilityDocument,
    "\n  mutation AddItem($characterId: ID!, $input: AddItemInput!) {\n    items {\n      add(characterId: $characterId, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.AddItemDocument,
    "\n  query ItemTemplates {\n    itemTemplates {\n      all {\n        key\n        label\n        type\n      }\n    }\n  }\n": typeof types.ItemTemplatesDocument,
    "\n  mutation AdjustGold($delta: Int!, $id: ID!) {\n    characters {\n      adjustGold(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.AdjustGoldDocument,
    "\n  mutation RemoveItem($id: ID!) {\n    items {\n      remove(id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.RemoveItemDocument,
    "\n  mutation SetItemCount($count: Int!, $id: ID!) {\n    items {\n      setCount(count: $count, id: $id) {\n        ...ItemFragment\n      }\n    }\n  }\n": typeof types.SetItemCountDocument,
    "\n  mutation ToggleItemWorn($id: ID!, $worn: Boolean!) {\n    items {\n      setWorn(id: $id, worn: $worn) {\n        ...ItemFragment\n      }\n    }\n  }\n": typeof types.ToggleItemWornDocument,
    "\n  mutation AdjustXp($delta: Int!, $id: ID!) {\n    characters {\n      adjustXp(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.AdjustXpDocument,
    "\n  query GetCharacter($id: ID!) {\n    characters {\n      byId(id: $id) {\n        ...CharacterFragment\n      }\n    }\n    moves {\n      basicMoves: byType(type: \"basic\") {\n        ...MoveFragment\n      }\n      specialMoves: byType(type: \"special\") {\n        ...MoveFragment\n      }\n    }\n  }\n": typeof types.GetCharacterDocument,
    "\n  mutation Heal($amount: Int!, $id: ID!) {\n    characters {\n      heal(amount: $amount, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.HealDocument,
    "\n  mutation TakeDamage($id: ID!, $input: TakeDamageInput!) {\n    characters {\n      takeDamage(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.TakeDamageDocument,
    "\n  mutation LevelUp($id: ID!, $input: LevelUpInput!) {\n    characters {\n      levelUp(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n": typeof types.LevelUpDocument,
    "\n  query GetCharacterClassesForCreate {\n    characterClasses {\n      all {\n        alignmentTemplates {\n          alignment\n          description\n        }\n        bonds\n        damageDie\n        hpBase\n        key\n        lookExamples {\n          examples\n          type\n        }\n        name\n        raceMoves {\n          key\n          ...MoveFragment\n        }\n        startingGear {\n          default {\n            ...ItemOptionFragment\n          }\n          loadBase\n          options {\n            pick\n            choices {\n              ...ItemOptionFragment\n            }\n          }\n        }\n        startingMoves {\n          key\n          ...MoveFragment\n        }\n      }\n    }\n    lookTypes {\n      all {\n        examples\n        key\n        name\n      }\n    }\n  }\n": typeof types.GetCharacterClassesForCreateDocument,
    "\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    characters {\n      create(input: $input) {\n        id\n        name\n      }\n    }\n  }\n": typeof types.CreateCharacterDocument,
    "\n  query GetCharacters {\n    characters {\n      all {\n        id\n        name\n      }\n    }\n  }\n": typeof types.GetCharactersDocument,
    "\n  fragment CharacterFragment on Character {\n    abilities {\n      ability\n      modifier\n      score\n    }\n    advancedMoves {\n      ...MoveFragment\n    }\n    alignmentDescription\n    alignmentType\n    armor\n    availableAdvancedMoves {\n      ...MoveFragment\n    }\n    canLevelUp\n    characterClass {\n      damageDie\n      hpBase\n      key\n      name\n    }\n    classMoves {\n      ...MoveFragment\n    }\n    debilities\n    equipment {\n      ...ItemFragment\n    }\n    gold\n    hitPoints\n    id\n    isDying\n    level\n    load\n    looks {\n      id\n      lookType {\n        key\n        name\n      }\n      value\n    }\n    maxHitPoints\n    maxLoad\n    name\n    raceMove {\n      ...MoveFragment\n    }\n    xp\n    xpToLevel\n  }\n": typeof types.CharacterFragmentFragmentDoc,
    "\n  fragment ItemFragment on Item {\n    count\n    description\n    id\n    isWorn\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n    type\n  }\n": typeof types.ItemFragmentFragmentDoc,
    "\n  fragment ItemOptionFragment on ItemOption {\n    count\n    description\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n  }\n": typeof types.ItemOptionFragmentFragmentDoc,
    "\n  fragment MoveFragment on Move {\n    creationOptions {\n      choices {\n        isPicked\n        key\n        label\n      }\n      label\n      pick\n    }\n    description\n    key\n    name\n    on10\n    on7to9\n    onMiss\n    options\n    replacesKey\n    requiresKey\n    roll\n    trigger\n    type\n  }\n": typeof types.MoveFragmentFragmentDoc,
};
const documents: Documents = {
    "\n  mutation SetDebility($active: Boolean!, $debility: Debility!, $id: ID!) {\n    characters {\n      setDebility(active: $active, debility: $debility, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.SetDebilityDocument,
    "\n  mutation AddItem($characterId: ID!, $input: AddItemInput!) {\n    items {\n      add(characterId: $characterId, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.AddItemDocument,
    "\n  query ItemTemplates {\n    itemTemplates {\n      all {\n        key\n        label\n        type\n      }\n    }\n  }\n": types.ItemTemplatesDocument,
    "\n  mutation AdjustGold($delta: Int!, $id: ID!) {\n    characters {\n      adjustGold(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.AdjustGoldDocument,
    "\n  mutation RemoveItem($id: ID!) {\n    items {\n      remove(id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.RemoveItemDocument,
    "\n  mutation SetItemCount($count: Int!, $id: ID!) {\n    items {\n      setCount(count: $count, id: $id) {\n        ...ItemFragment\n      }\n    }\n  }\n": types.SetItemCountDocument,
    "\n  mutation ToggleItemWorn($id: ID!, $worn: Boolean!) {\n    items {\n      setWorn(id: $id, worn: $worn) {\n        ...ItemFragment\n      }\n    }\n  }\n": types.ToggleItemWornDocument,
    "\n  mutation AdjustXp($delta: Int!, $id: ID!) {\n    characters {\n      adjustXp(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.AdjustXpDocument,
    "\n  query GetCharacter($id: ID!) {\n    characters {\n      byId(id: $id) {\n        ...CharacterFragment\n      }\n    }\n    moves {\n      basicMoves: byType(type: \"basic\") {\n        ...MoveFragment\n      }\n      specialMoves: byType(type: \"special\") {\n        ...MoveFragment\n      }\n    }\n  }\n": types.GetCharacterDocument,
    "\n  mutation Heal($amount: Int!, $id: ID!) {\n    characters {\n      heal(amount: $amount, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.HealDocument,
    "\n  mutation TakeDamage($id: ID!, $input: TakeDamageInput!) {\n    characters {\n      takeDamage(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.TakeDamageDocument,
    "\n  mutation LevelUp($id: ID!, $input: LevelUpInput!) {\n    characters {\n      levelUp(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n": types.LevelUpDocument,
    "\n  query GetCharacterClassesForCreate {\n    characterClasses {\n      all {\n        alignmentTemplates {\n          alignment\n          description\n        }\n        bonds\n        damageDie\n        hpBase\n        key\n        lookExamples {\n          examples\n          type\n        }\n        name\n        raceMoves {\n          key\n          ...MoveFragment\n        }\n        startingGear {\n          default {\n            ...ItemOptionFragment\n          }\n          loadBase\n          options {\n            pick\n            choices {\n              ...ItemOptionFragment\n            }\n          }\n        }\n        startingMoves {\n          key\n          ...MoveFragment\n        }\n      }\n    }\n    lookTypes {\n      all {\n        examples\n        key\n        name\n      }\n    }\n  }\n": types.GetCharacterClassesForCreateDocument,
    "\n  mutation CreateCharacter($input: CreateCharacterInput!) {\n    characters {\n      create(input: $input) {\n        id\n        name\n      }\n    }\n  }\n": types.CreateCharacterDocument,
    "\n  query GetCharacters {\n    characters {\n      all {\n        id\n        name\n      }\n    }\n  }\n": types.GetCharactersDocument,
    "\n  fragment CharacterFragment on Character {\n    abilities {\n      ability\n      modifier\n      score\n    }\n    advancedMoves {\n      ...MoveFragment\n    }\n    alignmentDescription\n    alignmentType\n    armor\n    availableAdvancedMoves {\n      ...MoveFragment\n    }\n    canLevelUp\n    characterClass {\n      damageDie\n      hpBase\n      key\n      name\n    }\n    classMoves {\n      ...MoveFragment\n    }\n    debilities\n    equipment {\n      ...ItemFragment\n    }\n    gold\n    hitPoints\n    id\n    isDying\n    level\n    load\n    looks {\n      id\n      lookType {\n        key\n        name\n      }\n      value\n    }\n    maxHitPoints\n    maxLoad\n    name\n    raceMove {\n      ...MoveFragment\n    }\n    xp\n    xpToLevel\n  }\n": types.CharacterFragmentFragmentDoc,
    "\n  fragment ItemFragment on Item {\n    count\n    description\n    id\n    isWorn\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n    type\n  }\n": types.ItemFragmentFragmentDoc,
    "\n  fragment ItemOptionFragment on ItemOption {\n    count\n    description\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n  }\n": types.ItemOptionFragmentFragmentDoc,
    "\n  fragment MoveFragment on Move {\n    creationOptions {\n      choices {\n        isPicked\n        key\n        label\n      }\n      label\n      pick\n    }\n    description\n    key\n    name\n    on10\n    on7to9\n    onMiss\n    options\n    replacesKey\n    requiresKey\n    roll\n    trigger\n    type\n  }\n": types.MoveFragmentFragmentDoc,
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
export function graphql(source: "\n  mutation SetDebility($active: Boolean!, $debility: Debility!, $id: ID!) {\n    characters {\n      setDebility(active: $active, debility: $debility, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SetDebility($active: Boolean!, $debility: Debility!, $id: ID!) {\n    characters {\n      setDebility(active: $active, debility: $debility, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddItem($characterId: ID!, $input: AddItemInput!) {\n    items {\n      add(characterId: $characterId, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddItem($characterId: ID!, $input: AddItemInput!) {\n    items {\n      add(characterId: $characterId, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ItemTemplates {\n    itemTemplates {\n      all {\n        key\n        label\n        type\n      }\n    }\n  }\n"): (typeof documents)["\n  query ItemTemplates {\n    itemTemplates {\n      all {\n        key\n        label\n        type\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AdjustGold($delta: Int!, $id: ID!) {\n    characters {\n      adjustGold(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AdjustGold($delta: Int!, $id: ID!) {\n    characters {\n      adjustGold(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveItem($id: ID!) {\n    items {\n      remove(id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveItem($id: ID!) {\n    items {\n      remove(id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetItemCount($count: Int!, $id: ID!) {\n    items {\n      setCount(count: $count, id: $id) {\n        ...ItemFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SetItemCount($count: Int!, $id: ID!) {\n    items {\n      setCount(count: $count, id: $id) {\n        ...ItemFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ToggleItemWorn($id: ID!, $worn: Boolean!) {\n    items {\n      setWorn(id: $id, worn: $worn) {\n        ...ItemFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ToggleItemWorn($id: ID!, $worn: Boolean!) {\n    items {\n      setWorn(id: $id, worn: $worn) {\n        ...ItemFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AdjustXp($delta: Int!, $id: ID!) {\n    characters {\n      adjustXp(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AdjustXp($delta: Int!, $id: ID!) {\n    characters {\n      adjustXp(delta: $delta, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCharacter($id: ID!) {\n    characters {\n      byId(id: $id) {\n        ...CharacterFragment\n      }\n    }\n    moves {\n      basicMoves: byType(type: \"basic\") {\n        ...MoveFragment\n      }\n      specialMoves: byType(type: \"special\") {\n        ...MoveFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacter($id: ID!) {\n    characters {\n      byId(id: $id) {\n        ...CharacterFragment\n      }\n    }\n    moves {\n      basicMoves: byType(type: \"basic\") {\n        ...MoveFragment\n      }\n      specialMoves: byType(type: \"special\") {\n        ...MoveFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Heal($amount: Int!, $id: ID!) {\n    characters {\n      heal(amount: $amount, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Heal($amount: Int!, $id: ID!) {\n    characters {\n      heal(amount: $amount, id: $id) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation TakeDamage($id: ID!, $input: TakeDamageInput!) {\n    characters {\n      takeDamage(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation TakeDamage($id: ID!, $input: TakeDamageInput!) {\n    characters {\n      takeDamage(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LevelUp($id: ID!, $input: LevelUpInput!) {\n    characters {\n      levelUp(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation LevelUp($id: ID!, $input: LevelUpInput!) {\n    characters {\n      levelUp(id: $id, input: $input) {\n        ...CharacterFragment\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCharacterClassesForCreate {\n    characterClasses {\n      all {\n        alignmentTemplates {\n          alignment\n          description\n        }\n        bonds\n        damageDie\n        hpBase\n        key\n        lookExamples {\n          examples\n          type\n        }\n        name\n        raceMoves {\n          key\n          ...MoveFragment\n        }\n        startingGear {\n          default {\n            ...ItemOptionFragment\n          }\n          loadBase\n          options {\n            pick\n            choices {\n              ...ItemOptionFragment\n            }\n          }\n        }\n        startingMoves {\n          key\n          ...MoveFragment\n        }\n      }\n    }\n    lookTypes {\n      all {\n        examples\n        key\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacterClassesForCreate {\n    characterClasses {\n      all {\n        alignmentTemplates {\n          alignment\n          description\n        }\n        bonds\n        damageDie\n        hpBase\n        key\n        lookExamples {\n          examples\n          type\n        }\n        name\n        raceMoves {\n          key\n          ...MoveFragment\n        }\n        startingGear {\n          default {\n            ...ItemOptionFragment\n          }\n          loadBase\n          options {\n            pick\n            choices {\n              ...ItemOptionFragment\n            }\n          }\n        }\n        startingMoves {\n          key\n          ...MoveFragment\n        }\n      }\n    }\n    lookTypes {\n      all {\n        examples\n        key\n        name\n      }\n    }\n  }\n"];
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
export function graphql(source: "\n  fragment CharacterFragment on Character {\n    abilities {\n      ability\n      modifier\n      score\n    }\n    advancedMoves {\n      ...MoveFragment\n    }\n    alignmentDescription\n    alignmentType\n    armor\n    availableAdvancedMoves {\n      ...MoveFragment\n    }\n    canLevelUp\n    characterClass {\n      damageDie\n      hpBase\n      key\n      name\n    }\n    classMoves {\n      ...MoveFragment\n    }\n    debilities\n    equipment {\n      ...ItemFragment\n    }\n    gold\n    hitPoints\n    id\n    isDying\n    level\n    load\n    looks {\n      id\n      lookType {\n        key\n        name\n      }\n      value\n    }\n    maxHitPoints\n    maxLoad\n    name\n    raceMove {\n      ...MoveFragment\n    }\n    xp\n    xpToLevel\n  }\n"): (typeof documents)["\n  fragment CharacterFragment on Character {\n    abilities {\n      ability\n      modifier\n      score\n    }\n    advancedMoves {\n      ...MoveFragment\n    }\n    alignmentDescription\n    alignmentType\n    armor\n    availableAdvancedMoves {\n      ...MoveFragment\n    }\n    canLevelUp\n    characterClass {\n      damageDie\n      hpBase\n      key\n      name\n    }\n    classMoves {\n      ...MoveFragment\n    }\n    debilities\n    equipment {\n      ...ItemFragment\n    }\n    gold\n    hitPoints\n    id\n    isDying\n    level\n    load\n    looks {\n      id\n      lookType {\n        key\n        name\n      }\n      value\n    }\n    maxHitPoints\n    maxLoad\n    name\n    raceMove {\n      ...MoveFragment\n    }\n    xp\n    xpToLevel\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ItemFragment on Item {\n    count\n    description\n    id\n    isWorn\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n    type\n  }\n"): (typeof documents)["\n  fragment ItemFragment on Item {\n    count\n    description\n    id\n    isWorn\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n    type\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ItemOptionFragment on ItemOption {\n    count\n    description\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n  }\n"): (typeof documents)["\n  fragment ItemOptionFragment on ItemOption {\n    count\n    description\n    key\n    label\n    tags {\n      key\n      name\n      quantity\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment MoveFragment on Move {\n    creationOptions {\n      choices {\n        isPicked\n        key\n        label\n      }\n      label\n      pick\n    }\n    description\n    key\n    name\n    on10\n    on7to9\n    onMiss\n    options\n    replacesKey\n    requiresKey\n    roll\n    trigger\n    type\n  }\n"): (typeof documents)["\n  fragment MoveFragment on Move {\n    creationOptions {\n      choices {\n        isPicked\n        key\n        label\n      }\n      label\n      pick\n    }\n    description\n    key\n    name\n    on10\n    on7to9\n    onMiss\n    options\n    replacesKey\n    requiresKey\n    roll\n    trigger\n    type\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;