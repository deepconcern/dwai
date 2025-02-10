/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Alignment = {
  __typename?: 'Alignment';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type AlignmentTemplate = {
  __typename?: 'AlignmentTemplate';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type Attribute = {
  __typename?: 'Attribute';
  modifier: Scalars['Int']['output'];
  score: Scalars['Int']['output'];
  type: AttributeType;
};

export type AttributeInput = {
  score: Scalars['Int']['input'];
  type: AttributeType;
};

export enum AttributeType {
  Charisma = 'CHARISMA',
  Constitution = 'CONSTITUTION',
  Dexterity = 'DEXTERITY',
  Intelligence = 'INTELLIGENCE',
  Strength = 'STRENGTH',
  Wisdom = 'WISDOM'
}

export type Bond = {
  __typename?: 'Bond';
  id: Scalars['ID']['output'];
  target: Character;
  text?: Maybe<Scalars['String']['output']>;
};

export type BondScore = {
  __typename?: 'BondScore';
  id: Scalars['ID']['output'];
  score: Scalars['Int']['output'];
  target: Character;
};

export type Campaign = {
  __typename?: 'Campaign';
  characters: Array<Character>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type CampaignMutation = {
  __typename?: 'CampaignMutation';
  create: Campaign;
  join: Campaign;
};


export type CampaignMutationCreateArgs = {
  input: CreateCampaignInput;
};


export type CampaignMutationJoinArgs = {
  input: JoinCampaignInput;
};

export type CampaignQuery = {
  __typename?: 'CampaignQuery';
  all: Array<Campaign>;
  byId: Campaign;
};


export type CampaignQueryByIdArgs = {
  id: Scalars['ID']['input'];
};

export type Character = ModelLoader & {
  __typename?: 'Character';
  alignment: Alignment;
  armor: Scalars['Int']['output'];
  attributes: Array<Attribute>;
  bondScoreByTarget: Scalars['Int']['output'];
  bondScores: Array<BondScore>;
  bonds: Array<Bond>;
  campaign?: Maybe<Campaign>;
  characterClass: CharacterClass;
  classMoves: Array<CharacterMove>;
  coin: Scalars['Int']['output'];
  currentHp: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  inventoryItems: Array<InventoryItem>;
  level: Scalars['Int']['output'];
  looks: Array<Look>;
  maxHp: Scalars['Int']['output'];
  maxWeight: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  partyMembers: Array<Character>;
  raceMove: CharacterMove;
  weight: Scalars['Int']['output'];
  xp: Scalars['Int']['output'];
};


export type CharacterBondScoreByTargetArgs = {
  targetId: Scalars['ID']['input'];
};

export type CharacterClass = ModelLoader & {
  __typename?: 'CharacterClass';
  advancedOneMoves: Array<MoveTemplate>;
  advancedTwoMoves: Array<MoveTemplate>;
  alignmentTemplates: Array<AlignmentTemplate>;
  bonds: Array<Bond>;
  damageDie: Scalars['Int']['output'];
  defaultStartingMoves: Array<MoveTemplate>;
  hpBase: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  pickableStartingMoves: Array<MoveTemplate>;
  raceMoves: Array<MoveTemplate>;
  weightBase: Scalars['Int']['output'];
};

export type CharacterClassQuery = {
  __typename?: 'CharacterClassQuery';
  all: Array<CharacterClass>;
  byId: CharacterClass;
};


export type CharacterClassQueryByIdArgs = {
  id: Scalars['ID']['input'];
};

export type CharacterMove = ModelLoader & Move & {
  __typename?: 'CharacterMove';
  diceOverrides: Array<DiceOverride>;
  forwards: Array<Forward>;
  id: Scalars['ID']['output'];
  moveOptions: Array<MoveOption>;
  name: Scalars['String']['output'];
  ongoings: Array<Ongoing>;
  roll?: Maybe<Scalars['String']['output']>;
  text: Scalars['String']['output'];
};

export type CharacterMutation = {
  __typename?: 'CharacterMutation';
  create: Character;
  levelUp: Character;
  markXp: Scalars['Int']['output'];
  updateCoin: Character;
  updateHp: Character;
};


export type CharacterMutationCreateArgs = {
  input: CreateCharacterInput;
};


export type CharacterMutationLevelUpArgs = {
  input: LevelCharacterInput;
};


export type CharacterMutationMarkXpArgs = {
  id: Scalars['ID']['input'];
};


export type CharacterMutationUpdateCoinArgs = {
  input: UpdateCoinInput;
};


export type CharacterMutationUpdateHpArgs = {
  input: UpdateHpInput;
};

export type CharacterQuery = {
  __typename?: 'CharacterQuery';
  all: Array<Character>;
  byId: Character;
};


export type CharacterQueryByIdArgs = {
  id: Scalars['ID']['input'];
};

export type CreateCampaignInput = {
  name: Scalars['String']['input'];
};

export type CreateCharacterInput = {
  attributes: Array<AttributeInput>;
  characterClassId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type DamageAddition = {
  __typename?: 'DamageAddition';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type DamageAdditionQuery = {
  __typename?: 'DamageAdditionQuery';
  all: Array<DamageAddition>;
};

export type DiceOverride = {
  __typename?: 'DiceOverride';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type Forward = {
  __typename?: 'Forward';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type ForwardQuery = {
  __typename?: 'ForwardQuery';
  all: Array<Forward>;
};

export type InventoryItem = {
  __typename?: 'InventoryItem';
  ammo?: Maybe<Scalars['Int']['output']>;
  armor?: Maybe<Scalars['Int']['output']>;
  cost?: Maybe<Scalars['Int']['output']>;
  extraArmor?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isDisabled: Scalars['Boolean']['output'];
  isWorn?: Maybe<Scalars['Boolean']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  weight?: Maybe<Scalars['Int']['output']>;
};

export type InventoryItemMutation = {
  __typename?: 'InventoryItemMutation';
  updateAmmo: InventoryItem;
};


export type InventoryItemMutationUpdateAmmoArgs = {
  input: UpdateAmmoInput;
};

export type JoinCampaignInput = {
  campaignId: Scalars['ID']['input'];
  characterId: Scalars['ID']['input'];
};

export type LevelCharacterInput = {
  id: Scalars['ID']['input'];
  increasedAttributeType: AttributeType;
};

export type Look = {
  __typename?: 'Look';
  id: Scalars['ID']['output'];
  lookTarget: LookTarget;
  text: Scalars['String']['output'];
};

export type LookTarget = {
  __typename?: 'LookTarget';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ModelLoader = {
  id: Scalars['ID']['output'];
};

export type Move = {
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  roll?: Maybe<Scalars['String']['output']>;
  text: Scalars['String']['output'];
};

export type MoveOption = {
  __typename?: 'MoveOption';
  id: Scalars['ID']['output'];
  move: MoveTemplate;
  value: Scalars['String']['output'];
};

export type MoveTemplate = ModelLoader & Move & {
  __typename?: 'MoveTemplate';
  diceOverrides: Array<DiceOverride>;
  forwards: Array<Forward>;
  id: Scalars['ID']['output'];
  isPickable: Scalars['Boolean']['output'];
  moveOptions: Array<MoveOption>;
  name: Scalars['String']['output'];
  ongoings: Array<Ongoing>;
  roll?: Maybe<Scalars['String']['output']>;
  text: Scalars['String']['output'];
};

export type MoveTemplateQuery = {
  __typename?: 'MoveTemplateQuery';
  all: Array<MoveTemplate>;
  byId: MoveTemplate;
  byType: Array<MoveTemplate>;
};


export type MoveTemplateQueryByIdArgs = {
  id: Scalars['ID']['input'];
};


export type MoveTemplateQueryByTypeArgs = {
  type: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  campaign: CampaignMutation;
  character: CharacterMutation;
  inventoryItem: InventoryItemMutation;
};

export type Ongoing = {
  __typename?: 'Ongoing';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  campaign: CampaignQuery;
  character: CharacterQuery;
  characterClass: CharacterClassQuery;
  damageAddition: DamageAdditionQuery;
  forward: ForwardQuery;
  moveTemplate: MoveTemplateQuery;
};

export type UpdateAmmoInput = {
  id: Scalars['ID']['input'];
  value: Scalars['Int']['input'];
};

export type UpdateCoinInput = {
  id: Scalars['ID']['input'];
  value: Scalars['Int']['input'];
};

export type UpdateHpInput = {
  id: Scalars['ID']['input'];
  value: Scalars['Int']['input'];
};

export type UpdateCoinMutationVariables = Exact<{
  input: UpdateCoinInput;
}>;


export type UpdateCoinMutation = { __typename?: 'Mutation', character: { __typename?: 'CharacterMutation', updateCoin: { __typename?: 'Character', coin: number, id: string } } };

export type UpdateAmmoMutationVariables = Exact<{
  input: UpdateAmmoInput;
}>;


export type UpdateAmmoMutation = { __typename?: 'Mutation', inventoryItem: { __typename?: 'InventoryItemMutation', updateAmmo: (
      { __typename?: 'InventoryItem' }
      & { ' $fragmentRefs'?: { 'FullInventoryItemFragment': FullInventoryItemFragment } }
    ) } };

export type GetCharacterClassQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetCharacterClassQuery = { __typename?: 'Query', characterClass: { __typename?: 'CharacterClassQuery', byId: { __typename?: 'CharacterClass', damageDie: number, hpBase: number, id: string, name: string } } };

export type GetMovesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMovesQuery = { __typename?: 'Query', damageAddition: { __typename?: 'DamageAdditionQuery', all: Array<{ __typename?: 'DamageAddition', id: string, name: string, value: string }> }, forward: { __typename?: 'ForwardQuery', all: Array<{ __typename?: 'Forward', id: string, name: string, value: number }> }, moveTemplate: { __typename?: 'MoveTemplateQuery', basic: Array<(
      { __typename?: 'MoveTemplate' }
      & { ' $fragmentRefs'?: { 'FullMoveTemplateFragment': FullMoveTemplateFragment } }
    )>, special: Array<(
      { __typename?: 'MoveTemplate' }
      & { ' $fragmentRefs'?: { 'FullMoveTemplateFragment': FullMoveTemplateFragment } }
    )> } };

export type MarkXpMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkXpMutation = { __typename?: 'Mutation', character: { __typename?: 'CharacterMutation', markXp: number } };

export type UpdateHpMutationVariables = Exact<{
  input: UpdateHpInput;
}>;


export type UpdateHpMutation = { __typename?: 'Mutation', character: { __typename?: 'CharacterMutation', updateHp: { __typename?: 'Character', id: string, currentHp: number } } };

export type CreateCharacterMutationVariables = Exact<{
  input: CreateCharacterInput;
}>;


export type CreateCharacterMutation = { __typename?: 'Mutation', character: { __typename?: 'CharacterMutation', create: { __typename?: 'Character', id: string, name: string, characterClass: { __typename?: 'CharacterClass', id: string, name: string } } } };

export type HomePageQueryVariables = Exact<{ [key: string]: never; }>;


export type HomePageQuery = { __typename?: 'Query', character: { __typename?: 'CharacterQuery', all: Array<{ __typename?: 'Character', id: string, name: string, characterClass: { __typename?: 'CharacterClass', id: string, name: string } }> } };

export type FullCharacterFragment = { __typename?: 'Character', armor: number, coin: number, currentHp: number, id: string, level: number, maxHp: number, maxWeight: number, name: string, weight: number, xp: number, alignment: { __typename?: 'Alignment', id: string, name: string, text: string }, attributes: Array<{ __typename?: 'Attribute', modifier: number, type: AttributeType, score: number }>, bonds: Array<{ __typename?: 'Bond', id: string, text?: string | null, target: (
      { __typename?: 'Character' }
      & { ' $fragmentRefs'?: { 'ShortCharacterFragment': ShortCharacterFragment } }
    ) }>, bondScores: Array<{ __typename?: 'BondScore', id: string, score: number, target: (
      { __typename?: 'Character' }
      & { ' $fragmentRefs'?: { 'ShortCharacterFragment': ShortCharacterFragment } }
    ) }>, characterClass: { __typename?: 'CharacterClass', damageDie: number, id: string, name: string }, classMoves: Array<(
    { __typename?: 'CharacterMove' }
    & { ' $fragmentRefs'?: { 'FullCharacterMoveFragment': FullCharacterMoveFragment } }
  )>, inventoryItems: Array<(
    { __typename?: 'InventoryItem' }
    & { ' $fragmentRefs'?: { 'FullInventoryItemFragment': FullInventoryItemFragment } }
  )>, looks: Array<{ __typename?: 'Look', id: string, text: string, lookTarget: { __typename?: 'LookTarget', id: string, name: string } }>, partyMembers: Array<(
    { __typename?: 'Character' }
    & { ' $fragmentRefs'?: { 'ShortCharacterFragment': ShortCharacterFragment } }
  )>, raceMove: (
    { __typename?: 'CharacterMove' }
    & { ' $fragmentRefs'?: { 'FullCharacterMoveFragment': FullCharacterMoveFragment } }
  ) } & { ' $fragmentName'?: 'FullCharacterFragment' };

export type FullCharacterClassFragment = { __typename?: 'CharacterClass', damageDie: number, hpBase: number, id: string, name: string, weightBase: number, alignmentTemplates: Array<{ __typename?: 'AlignmentTemplate', id: string, name: string, text: string }>, defaultStartingMoves: Array<(
    { __typename?: 'MoveTemplate' }
    & { ' $fragmentRefs'?: { 'ShortMoveTemplateFragment': ShortMoveTemplateFragment } }
  )>, pickableStartingMoves: Array<(
    { __typename?: 'MoveTemplate' }
    & { ' $fragmentRefs'?: { 'ShortMoveTemplateFragment': ShortMoveTemplateFragment } }
  )>, raceMoves: Array<(
    { __typename?: 'MoveTemplate' }
    & { ' $fragmentRefs'?: { 'ShortMoveTemplateFragment': ShortMoveTemplateFragment } }
  )> } & { ' $fragmentName'?: 'FullCharacterClassFragment' };

export type FullCharacterMoveFragment = { __typename?: 'CharacterMove', id: string, name: string, roll?: string | null, text: string, diceOverrides: Array<{ __typename?: 'DiceOverride', id: string, name: string, value: string }>, forwards: Array<{ __typename?: 'Forward', id: string, name: string, value: number }>, moveOptions: Array<{ __typename?: 'MoveOption', id: string, value: string }>, ongoings: Array<{ __typename?: 'Ongoing', id: string, name: string, value: number }> } & { ' $fragmentName'?: 'FullCharacterMoveFragment' };

export type FullInventoryItemFragment = { __typename?: 'InventoryItem', ammo?: number | null, armor?: number | null, cost?: number | null, extraArmor?: number | null, id: string, isDisabled: boolean, isWorn?: boolean | null, location?: string | null, name: string, tags: Array<string>, type: string, weight?: number | null } & { ' $fragmentName'?: 'FullInventoryItemFragment' };

export type FullMoveTemplateFragment = { __typename?: 'MoveTemplate', id: string, name: string, roll?: string | null, text: string, diceOverrides: Array<{ __typename?: 'DiceOverride', id: string, name: string, value: string }>, forwards: Array<{ __typename?: 'Forward', id: string, name: string, value: number }>, moveOptions: Array<{ __typename?: 'MoveOption', id: string, value: string }>, ongoings: Array<{ __typename?: 'Ongoing', id: string, name: string, value: number }> } & { ' $fragmentName'?: 'FullMoveTemplateFragment' };

export type GetCharacterClassesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCharacterClassesQuery = { __typename?: 'Query', characterClass: { __typename?: 'CharacterClassQuery', all: Array<(
      { __typename?: 'CharacterClass' }
      & { ' $fragmentRefs'?: { 'FullCharacterClassFragment': FullCharacterClassFragment } }
    )> } };

export type GetCharacterQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetCharacterQuery = { __typename?: 'Query', character: { __typename?: 'CharacterQuery', byId: (
      { __typename?: 'Character' }
      & { ' $fragmentRefs'?: { 'FullCharacterFragment': FullCharacterFragment } }
    ) } };

export type ShortCharacterFragment = { __typename?: 'Character', id: string, name: string } & { ' $fragmentName'?: 'ShortCharacterFragment' };

export type ShortMoveTemplateFragment = { __typename?: 'MoveTemplate', id: string, isPickable: boolean, name: string, text: string } & { ' $fragmentName'?: 'ShortMoveTemplateFragment' };

export const ShortCharacterFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ShortCharacter"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Character"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<ShortCharacterFragment, unknown>;
export const FullCharacterMoveFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullCharacterMove"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CharacterMove"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diceOverrides"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"forwards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"moveOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ongoings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roll"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]} as unknown as DocumentNode<FullCharacterMoveFragment, unknown>;
export const FullInventoryItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullInventoryItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InventoryItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ammo"}},{"kind":"Field","name":{"kind":"Name","value":"armor"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"extraArmor"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isDisabled"}},{"kind":"Field","name":{"kind":"Name","value":"isWorn"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}}]}}]} as unknown as DocumentNode<FullInventoryItemFragment, unknown>;
export const FullCharacterFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullCharacter"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Character"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alignment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}},{"kind":"Field","name":{"kind":"Name","value":"armor"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"modifier"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"score"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bonds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"target"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShortCharacter"}}]}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bondScores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"target"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShortCharacter"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"characterClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"damageDie"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"classMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CharacterMove"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullCharacterMove"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coin"}},{"kind":"Field","name":{"kind":"Name","value":"currentHp"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inventoryItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullInventoryItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"looks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lookTarget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}},{"kind":"Field","name":{"kind":"Name","value":"maxHp"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"partyMembers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShortCharacter"}}]}},{"kind":"Field","name":{"kind":"Name","value":"raceMove"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CharacterMove"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullCharacterMove"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"xp"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ShortCharacter"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Character"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullCharacterMove"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CharacterMove"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diceOverrides"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"forwards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"moveOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ongoings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roll"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullInventoryItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InventoryItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ammo"}},{"kind":"Field","name":{"kind":"Name","value":"armor"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"extraArmor"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isDisabled"}},{"kind":"Field","name":{"kind":"Name","value":"isWorn"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}}]}}]} as unknown as DocumentNode<FullCharacterFragment, unknown>;
export const ShortMoveTemplateFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ShortMoveTemplate"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoveTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isPickable"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]} as unknown as DocumentNode<ShortMoveTemplateFragment, unknown>;
export const FullCharacterClassFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullCharacterClass"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CharacterClass"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alignmentTemplates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}},{"kind":"Field","name":{"kind":"Name","value":"damageDie"}},{"kind":"Field","name":{"kind":"Name","value":"defaultStartingMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShortMoveTemplate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hpBase"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"pickableStartingMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShortMoveTemplate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"raceMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShortMoveTemplate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weightBase"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ShortMoveTemplate"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoveTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isPickable"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]} as unknown as DocumentNode<FullCharacterClassFragment, unknown>;
export const FullMoveTemplateFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullMoveTemplate"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoveTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diceOverrides"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"forwards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"moveOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ongoings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roll"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]} as unknown as DocumentNode<FullMoveTemplateFragment, unknown>;
export const UpdateCoinDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCoin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCoinInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"character"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCoin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"coin"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCoinMutation, UpdateCoinMutationVariables>;
export const UpdateAmmoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAmmo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAmmoInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inventoryItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAmmo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullInventoryItem"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullInventoryItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InventoryItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ammo"}},{"kind":"Field","name":{"kind":"Name","value":"armor"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"extraArmor"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isDisabled"}},{"kind":"Field","name":{"kind":"Name","value":"isWorn"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}}]}}]} as unknown as DocumentNode<UpdateAmmoMutation, UpdateAmmoMutationVariables>;
export const GetCharacterClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacterClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"byId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"damageDie"}},{"kind":"Field","name":{"kind":"Name","value":"hpBase"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetCharacterClassQuery, GetCharacterClassQueryVariables>;
export const GetMovesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"damageAddition"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"forward"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"moveTemplate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"basic"},"name":{"kind":"Name","value":"byType"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"StringValue","value":"basic","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoveTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullMoveTemplate"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"special"},"name":{"kind":"Name","value":"byType"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"StringValue","value":"special","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoveTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullMoveTemplate"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullMoveTemplate"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoveTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diceOverrides"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"forwards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"moveOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ongoings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roll"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]} as unknown as DocumentNode<GetMovesQuery, GetMovesQueryVariables>;
export const MarkXpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkXp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"character"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markXp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]}}]} as unknown as DocumentNode<MarkXpMutation, MarkXpMutationVariables>;
export const UpdateHpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateHp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateHpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"character"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateHp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"currentHp"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateHpMutation, UpdateHpMutationVariables>;
export const CreateCharacterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCharacter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCharacterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"character"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CreateCharacterMutation, CreateCharacterMutationVariables>;
export const HomePageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"HomePage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"character"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<HomePageQuery, HomePageQueryVariables>;
export const GetCharacterClassesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacterClasses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullCharacterClass"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ShortMoveTemplate"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MoveTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isPickable"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullCharacterClass"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CharacterClass"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alignmentTemplates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}},{"kind":"Field","name":{"kind":"Name","value":"damageDie"}},{"kind":"Field","name":{"kind":"Name","value":"defaultStartingMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShortMoveTemplate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hpBase"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"pickableStartingMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShortMoveTemplate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"raceMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShortMoveTemplate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"weightBase"}}]}}]} as unknown as DocumentNode<GetCharacterClassesQuery, GetCharacterClassesQueryVariables>;
export const GetCharacterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"character"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"byId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullCharacter"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ShortCharacter"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Character"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullCharacterMove"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CharacterMove"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diceOverrides"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"forwards"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"moveOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ongoings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roll"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullInventoryItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InventoryItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ammo"}},{"kind":"Field","name":{"kind":"Name","value":"armor"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"extraArmor"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isDisabled"}},{"kind":"Field","name":{"kind":"Name","value":"isWorn"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullCharacter"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Character"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alignment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}},{"kind":"Field","name":{"kind":"Name","value":"armor"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"modifier"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"score"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bonds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"target"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShortCharacter"}}]}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bondScores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"target"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShortCharacter"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"characterClass"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"damageDie"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"classMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CharacterMove"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullCharacterMove"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"coin"}},{"kind":"Field","name":{"kind":"Name","value":"currentHp"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"inventoryItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullInventoryItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"looks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"lookTarget"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}},{"kind":"Field","name":{"kind":"Name","value":"maxHp"}},{"kind":"Field","name":{"kind":"Name","value":"maxWeight"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"partyMembers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ShortCharacter"}}]}},{"kind":"Field","name":{"kind":"Name","value":"raceMove"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CharacterMove"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullCharacterMove"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"xp"}}]}}]} as unknown as DocumentNode<GetCharacterQuery, GetCharacterQueryVariables>;