/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** The six core ability scores used for all rolls and derived stats in Dungeon World. */
export type Ability =
  /** Charisma (CHA) — used for social manipulation, bard magic, and paladin healing. */
  | 'CHARISMA'
  /** Constitution (CON) — used for HP calculation and endurance rolls. */
  | 'CONSTITUTION'
  /** Dexterity (DEX) — used for ranged attacks, agility, and traps. */
  | 'DEXTERITY'
  /** Intelligence (INT) — used for knowledge checks and arcane magic (Wizard). */
  | 'INTELLIGENCE'
  /** Strength (STR) — used for melee attacks and feats of force. */
  | 'STRENGTH'
  /** Wisdom (WIS) — used for perception, divine magic (Cleric), and nature magic (Druid/Ranger). */
  | 'WISDOM';

/** Input for setting an ability score when creating a character. */
export type AbilityScoreInput = {
  /** The ability this score belongs to. */
  ability: Ability;
  /** The numeric score for this ability. */
  score: number;
};

/** Input for creating a new character. */
export type CreateCharacterInput = {
  abilities: Array<AbilityScoreInput>;
  /** One look selection per look type. */
  looks: Array<NewLookInput>;
  /** The character's name. */
  name: string;
};

/** A single look selection when creating a character. */
export type NewLookInput = {
  /** The key of the look type being set. */
  lookTypeKey: string;
  /** The chosen appearance value. */
  value: string;
};

export type GetCharacterQueryVariables = Exact<{
  id: string | number;
}>;


export type GetCharacterQuery = { characters: { byId: { id: string, name: string } } };

export type GetCharacterClassesForCreateQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCharacterClassesForCreateQuery = { characterClasses: { all: Array<{ bonds: Array<string>, damageDie: number, hpBase: number, key: string, name: string, alignmentTemplates: Array<{ alignment: string, description: string }>, lookExamples: Array<{ examples: Array<string>, type: string }>, raceMoves: Array<(
        { key: string }
        & { ' $fragmentRefs'?: { 'MoveFragmentFragment': MoveFragmentFragment } }
      )>, startingGear: { loadBase: number, default: Array<{ ' $fragmentRefs'?: { 'GearItemFragmentFragment': GearItemFragmentFragment } }>, options: Array<{ pick: number, choices: Array<Array<{ ' $fragmentRefs'?: { 'GearItemFragmentFragment': GearItemFragmentFragment } }>> }> }, startingMoves: Array<(
        { key: string }
        & { ' $fragmentRefs'?: { 'MoveFragmentFragment': MoveFragmentFragment } }
      )> }> } };

export type CreateCharacterMutationVariables = Exact<{
  input: CreateCharacterInput;
}>;


export type CreateCharacterMutation = { characters: { create: { id: string, name: string } } };

export type GetCharactersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCharactersQuery = { characters: { all: Array<{ id: string, name: string }> } };

export type GearItemFragmentFragment = { count: number, description: string, key: string, label: string, tags: Array<{ key: string, name: string, quantity: number | null }> } & { ' $fragmentName'?: 'GearItemFragmentFragment' };

export type MoveFragmentFragment = { description: string | null, key: string, name: string, on10: string | null, on7to9: string | null, onMiss: string | null, options: Array<string>, replacesKey: string | null, requiresKey: string | null, roll: string | null, trigger: string | null, type: string } & { ' $fragmentName'?: 'MoveFragmentFragment' };

export const GearItemFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GearItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GearItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}}]}}]} as unknown as DocumentNode<GearItemFragmentFragment, unknown>;
export const MoveFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoveFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Move"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"on10"}},{"kind":"Field","name":{"kind":"Name","value":"on7to9"}},{"kind":"Field","name":{"kind":"Name","value":"onMiss"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"replacesKey"}},{"kind":"Field","name":{"kind":"Name","value":"requiresKey"}},{"kind":"Field","name":{"kind":"Name","value":"roll"}},{"kind":"Field","name":{"kind":"Name","value":"trigger"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]} as unknown as DocumentNode<MoveFragmentFragment, unknown>;
export const GetCharacterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"byId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetCharacterQuery, GetCharacterQueryVariables>;
export const GetCharacterClassesForCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacterClassesForCreate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterClasses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alignmentTemplates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alignment"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bonds"}},{"kind":"Field","name":{"kind":"Name","value":"damageDie"}},{"kind":"Field","name":{"kind":"Name","value":"hpBase"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"lookExamples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"examples"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"raceMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoveFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"startingGear"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"default"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GearItemFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loadBase"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pick"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GearItemFragment"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"startingMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"MoveFragment"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MoveFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Move"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"on10"}},{"kind":"Field","name":{"kind":"Name","value":"on7to9"}},{"kind":"Field","name":{"kind":"Name","value":"onMiss"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"replacesKey"}},{"kind":"Field","name":{"kind":"Name","value":"requiresKey"}},{"kind":"Field","name":{"kind":"Name","value":"roll"}},{"kind":"Field","name":{"kind":"Name","value":"trigger"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GearItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GearItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}}]}}]} as unknown as DocumentNode<GetCharacterClassesForCreateQuery, GetCharacterClassesForCreateQueryVariables>;
export const CreateCharacterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCharacter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCharacterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CreateCharacterMutation, CreateCharacterMutationVariables>;
export const GetCharactersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetCharactersQuery, GetCharactersQueryVariables>;