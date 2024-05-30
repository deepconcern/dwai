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
  /** Date with time (isoformat) */
  DateTime: { input: any; output: any; }
  UUID: { input: any; output: any; }
};

export type Character = {
  __typename?: 'Character';
  id: Scalars['ID']['output'];
  looks: Array<Look>;
  name: Scalars['String']['output'];
};

export type CharacterClass = {
  __typename?: 'CharacterClass';
  alignmentMoves: Array<Move>;
  damageDie: Scalars['Int']['output'];
  hpBase: Scalars['Int']['output'];
  key: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  raceMoves: Array<Move>;
  startingMoves: Array<Move>;
};

export type CharacterClassesQuery = {
  __typename?: 'CharacterClassesQuery';
  all: Array<CharacterClass>;
  byKey?: Maybe<CharacterClass>;
};


export type CharacterClassesQueryByKeyArgs = {
  key: Scalars['ID']['input'];
};

export type CharactersMutation = {
  __typename?: 'CharactersMutation';
  create: Character;
};


export type CharactersMutationCreateArgs = {
  input: NewCharacterInput;
};

export type CharactersQuery = {
  __typename?: 'CharactersQuery';
  all: Array<Character>;
  byId?: Maybe<Character>;
};


export type CharactersQueryByIdArgs = {
  id: Scalars['ID']['input'];
};

export type Game = {
  __typename?: 'Game';
  characterId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  scenarioKey: Scalars['String']['output'];
};

export type GamesMutation = {
  __typename?: 'GamesMutation';
  create: Game;
};


export type GamesMutationCreateArgs = {
  characterId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  scenarioKey: Scalars['String']['input'];
};

export type GamesQuery = {
  __typename?: 'GamesQuery';
  all: Array<Game>;
  byId?: Maybe<Game>;
};


export type GamesQueryByIdArgs = {
  id: Scalars['ID']['input'];
};

export type Look = {
  __typename?: 'Look';
  id: Scalars['ID']['output'];
  lookType?: Maybe<LookType>;
  value: Scalars['String']['output'];
};

export type LookType = {
  __typename?: 'LookType';
  examples: Array<Scalars['String']['output']>;
  key: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type LookTypesQuery = {
  __typename?: 'LookTypesQuery';
  all: Array<LookType>;
};

export type Message = {
  __typename?: 'Message';
  author: Scalars['String']['output'];
  content: Scalars['String']['output'];
  datetime: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
};

export type MessagesMutation = {
  __typename?: 'MessagesMutation';
  send: Message;
};


export type MessagesMutationSendArgs = {
  content: Scalars['String']['input'];
};

export type MessagesQuery = {
  __typename?: 'MessagesQuery';
  all: Array<Message>;
};

export type Move = {
  __typename?: 'Move';
  key: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  text: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type MovesQuery = {
  __typename?: 'MovesQuery';
  all: Array<Move>;
  byKey?: Maybe<Move>;
};


export type MovesQueryByKeyArgs = {
  key: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  characters: CharactersMutation;
  games: GamesMutation;
  messages: MessagesMutation;
};

export type NewCharacterInput = {
  looks: Array<NewLookInput>;
  name: Scalars['String']['input'];
};

export type NewLookInput = {
  lookTypeKey: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  apiVersion: Scalars['String']['output'];
  characterClasses: CharacterClassesQuery;
  characters: CharactersQuery;
  games: GamesQuery;
  lookTypes: LookTypesQuery;
  messages: MessagesQuery;
  moves: MovesQuery;
  scenarios: ScenariosQuery;
};

export type Scenario = {
  __typename?: 'Scenario';
  description: Scalars['String']['output'];
  key: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ScenariosQuery = {
  __typename?: 'ScenariosQuery';
  all: Array<Scenario>;
  byKey?: Maybe<Scenario>;
};


export type ScenariosQueryByKeyArgs = {
  key: Scalars['ID']['input'];
};

export type GetCharacterQueryVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;


export type GetCharacterQuery = { __typename?: 'Query', characters: { __typename?: 'CharactersQuery', byId?: { __typename?: 'Character', id: string, name: string } | null } };

export type CreateCharacterMutationVariables = Exact<{
  input: NewCharacterInput;
}>;


export type CreateCharacterMutation = { __typename?: 'Mutation', characters: { __typename?: 'CharactersMutation', create: { __typename?: 'Character', id: string, name: string } } };

export type GetCharacterClassesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCharacterClassesQuery = { __typename?: 'Query', characterClasses: { __typename?: 'CharacterClassesQuery', all: Array<{ __typename?: 'CharacterClass', damageDie: number, hpBase: number, key: string, name: string, alignmentMoves: Array<{ __typename?: 'Move', key: string, name: string, text: string, type: string }>, raceMoves: Array<{ __typename?: 'Move', key: string, name: string, text: string, type: string }>, startingMoves: Array<{ __typename?: 'Move', key: string, name: string, text: string, type: string }> }> } };

export type GetLookTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLookTypesQuery = { __typename?: 'Query', lookTypes: { __typename?: 'LookTypesQuery', all: Array<{ __typename?: 'LookType', examples: Array<string>, key: string, name: string }> } };

export type GetMovesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMovesQuery = { __typename?: 'Query', moves: { __typename?: 'MovesQuery', all: Array<{ __typename?: 'Move', key: string, name: string, text: string, type: string }> } };

export type CreateGameMutationVariables = Exact<{
  characterId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  scenarioKey: Scalars['String']['input'];
}>;


export type CreateGameMutation = { __typename?: 'Mutation', games: { __typename?: 'GamesMutation', create: { __typename?: 'Game', id: string, name: string } } };

export type GetScenariosQueryVariables = Exact<{ [key: string]: never; }>;


export type GetScenariosQuery = { __typename?: 'Query', scenarios: { __typename?: 'ScenariosQuery', all: Array<{ __typename?: 'Scenario', description: string, key: string, name: string }> } };

export type GetMessagesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMessagesQuery = { __typename?: 'Query', messages: { __typename?: 'MessagesQuery', all: Array<{ __typename?: 'Message', author: string, content: string, datetime: any, id: any }> } };

export type SendMessageMutationVariables = Exact<{
  content: Scalars['String']['input'];
}>;


export type SendMessageMutation = { __typename?: 'Mutation', messages: { __typename?: 'MessagesMutation', send: { __typename?: 'Message', author: string, content: string, datetime: any, id: any } } };

export type GetGamesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGamesQuery = { __typename?: 'Query', games: { __typename?: 'GamesQuery', all: Array<{ __typename?: 'Game', id: string, name: string }> } };

export type GetCharactersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCharactersQuery = { __typename?: 'Query', characters: { __typename?: 'CharactersQuery', all: Array<{ __typename?: 'Character', id: string, name: string }> } };


export const GetCharacterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"byId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetCharacterQuery, GetCharacterQueryVariables>;
export const CreateCharacterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCharacter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NewCharacterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CreateCharacterMutation, CreateCharacterMutationVariables>;
export const GetCharacterClassesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacterClasses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterClasses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alignmentMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"damageDie"}},{"kind":"Field","name":{"kind":"Name","value":"hpBase"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"raceMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"startingMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetCharacterClassesQuery, GetCharacterClassesQueryVariables>;
export const GetLookTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLookTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lookTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"examples"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetLookTypesQuery, GetLookTypesQueryVariables>;
export const GetMovesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]} as unknown as DocumentNode<GetMovesQuery, GetMovesQueryVariables>;
export const CreateGameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scenarioKey"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"games"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"characterId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"scenarioKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scenarioKey"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CreateGameMutation, CreateGameMutationVariables>;
export const GetScenariosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetScenarios"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scenarios"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetScenariosQuery, GetScenariosQueryVariables>;
export const GetMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMessages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"datetime"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<GetMessagesQuery, GetMessagesQueryVariables>;
export const SendMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"send"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"datetime"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<SendMessageMutation, SendMessageMutationVariables>;
export const GetGamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGames"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"games"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetGamesQuery, GetGamesQueryVariables>;
export const GetCharactersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetCharactersQuery, GetCharactersQueryVariables>;