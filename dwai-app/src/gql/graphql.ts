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
  /** ISO 8601 datetime string. */
  DateTime: { input: any; output: any; }
  /** UUID string identifier. */
  UUID: { input: any; output: any; }
};

/** An example of an alignment a player may use */
export type AlignmentTemplate = {
  __typename?: 'AlignmentTemplate';
  /** The alignment type */
  alignment: Scalars['String']['output'];
  /** A description of what their goals are */
  description: Scalars['String']['output'];
};

/** A player character in the game. */
export type Character = {
  __typename?: 'Character';
  /** Unique identifier for the character. */
  id: Scalars['ID']['output'];
  /** The character's appearance choices, one per look type. */
  looks: Array<Look>;
  /** The character's name. */
  name: Scalars['String']['output'];
};

/** A playable character class as defined by the Dungeon World ruleset (e.g. Fighter, Wizard). */
export type CharacterClass = {
  __typename?: 'CharacterClass';
  /** Moves available when choosing an alignment for this class. */
  alignmentTemplates: Array<AlignmentTemplate>;
  /** Example bonds templates. */
  bonds: Array<Scalars['String']['output']>;
  /** The die used for damage rolls (e.g. 8 for d8). */
  damageDie: Scalars['Int']['output'];
  /** Base hit points before adding Constitution modifier. */
  hpBase: Scalars['Int']['output'];
  /** Unique key for this class. */
  key: Scalars['ID']['output'];
  /** Examples of looks commonly associated with this class. */
  lookExamples: Array<LookExample>;
  /** Human-readable class name. */
  name: Scalars['String']['output'];
  /** Moves available when choosing a race for this class. */
  raceMoves: Array<Move>;
  /** Moves every character of this class begins with. */
  startingMoves: Array<Move>;
};

/** Namespace for character class queries. */
export type CharacterClassQuery = {
  __typename?: 'CharacterClassQuery';
  /** Returns all character classes. */
  all: Array<CharacterClass>;
  /** Returns a single character class by key, or null if not found. */
  byKey: CharacterClass;
};


/** Namespace for character class queries. */
export type CharacterClassQueryByKeyArgs = {
  key: Scalars['ID']['input'];
};

/** Namespace for character mutations. */
export type CharacterMutation = {
  __typename?: 'CharacterMutation';
  /** Creates a new character and returns it. */
  create: Character;
};


/** Namespace for character mutations. */
export type CharacterMutationCreateArgs = {
  input: CreateCharacterInput;
};

/** Namespace for character queries. */
export type CharacterQuery = {
  __typename?: 'CharacterQuery';
  /** Returns all characters. */
  all: Array<Character>;
  /** Returns a single character by ID, or null if not found. */
  byId?: Maybe<Character>;
};


/** Namespace for character queries. */
export type CharacterQueryByIdArgs = {
  id: Scalars['ID']['input'];
};

/** Input for creating a new character. */
export type CreateCharacterInput = {
  /** One look selection per look type. */
  looks: Array<NewLookInput>;
  /** The character's name. */
  name: Scalars['String']['input'];
};

/** An active game session linking a character to a scenario. */
export type Game = {
  __typename?: 'Game';
  /** ID of the character playing in this game. */
  characterId: Scalars['String']['output'];
  /** Unique identifier for the game. */
  id: Scalars['ID']['output'];
  /** Human-readable name for this game session. */
  name: Scalars['String']['output'];
  /** Key of the scenario being played. */
  scenarioKey: Scalars['String']['output'];
};

/** Namespace for game mutations. */
export type GameMutation = {
  __typename?: 'GameMutation';
  /** Creates a new game session and returns it. */
  create: Game;
};


/** Namespace for game mutations. */
export type GameMutationCreateArgs = {
  characterId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  scenarioKey: Scalars['String']['input'];
};

/** Namespace for game queries. */
export type GameQuery = {
  __typename?: 'GameQuery';
  /** Returns all games. */
  all: Array<Game>;
  /** Returns a single game by ID, or null if not found. */
  byId?: Maybe<Game>;
};


/** Namespace for game queries. */
export type GameQueryByIdArgs = {
  id: Scalars['ID']['input'];
};

/** A single appearance choice made for a character. */
export type Look = {
  __typename?: 'Look';
  /** Unique identifier for this look entry. */
  id: Scalars['ID']['output'];
  /** The look type this value belongs to (e.g. Eyes, Hair). Null if the look type no longer exists. */
  lookType?: Maybe<LookType>;
  /** The chosen appearance value (e.g. 'Wild Eyes'). */
  value: Scalars['String']['output'];
};

export type LookExample = {
  __typename?: 'LookExample';
  /** Examples of looks for this type. */
  examples: Array<Scalars['String']['output']>;
  /** The type of look (e.g. clothing, hair, etc.) */
  type: Scalars['String']['output'];
};

/** A category of appearance choice available when creating a character (e.g. Eyes, Hair, Body). */
export type LookType = {
  __typename?: 'LookType';
  /** Example values players can choose from (e.g. 'Wild Eyes', 'Sunken Eyes'). */
  examples: Array<Scalars['String']['output']>;
  /** Unique key for this look type. */
  key: Scalars['ID']['output'];
  /** Human-readable name (e.g. 'Eyes'). */
  name: Scalars['String']['output'];
};

/** Namespace for look type queries. */
export type LookTypeQuery = {
  __typename?: 'LookTypeQuery';
  /** Returns all look types. */
  all: Array<LookType>;
};

/** A message in the game's conversation history. */
export type Message = {
  __typename?: 'Message';
  /** Who sent the message (e.g. the player's character name or 'assistant'). */
  author: Scalars['String']['output'];
  /** The message text. */
  content: Scalars['String']['output'];
  /** When the message was sent. */
  datetime: Scalars['DateTime']['output'];
  /** Unique identifier for the message. */
  id: Scalars['UUID']['output'];
};

/** Namespace for message mutations. */
export type MessageMutation = {
  __typename?: 'MessageMutation';
  /** Sends a player message and returns the resulting assistant reply. */
  send: Message;
};


/** Namespace for message mutations. */
export type MessageMutationSendArgs = {
  content: Scalars['String']['input'];
};

/** Namespace for message queries. */
export type MessageQuery = {
  __typename?: 'MessageQuery';
  /** Returns all messages in the current game's conversation. */
  all: Array<Message>;
};

/** An action or ability a character can perform, as defined by the Dungeon World ruleset. */
export type Move = {
  __typename?: 'Move';
  /** Unique key for this move. */
  key: Scalars['ID']['output'];
  /** Human-readable name of the move. */
  name: Scalars['String']['output'];
  /** The trigger for when a move is used. */
  trigger: Scalars['String']['output'];
  /** Category of the move (e.g. 'starting', 'alignment', 'race'). */
  type: Scalars['String']['output'];
};

/** Namespace for move queries. */
export type MoveQuery = {
  __typename?: 'MoveQuery';
  /** Returns all moves. */
  all: Array<Move>;
  /** Returns a single move by key, or null if not found. */
  byKey: Move;
};


/** Namespace for move queries. */
export type MoveQueryByKeyArgs = {
  key: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Mutations for player characters. */
  characters: CharacterMutation;
  /** Mutations for active games. */
  games: GameMutation;
  /** Mutations for in-game messages. */
  messages: MessageMutation;
};

/** A single look selection when creating a character. */
export type NewLookInput = {
  /** The key of the look type being set. */
  lookTypeKey: Scalars['String']['input'];
  /** The chosen appearance value. */
  value: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  /** Current API version string. */
  apiVersion: Scalars['String']['output'];
  /** Queries for character classes (e.g. Fighter, Wizard). */
  characterClasses: CharacterClassQuery;
  /** Queries for player characters. */
  characters: CharacterQuery;
  /** Queries for active games. */
  games: GameQuery;
  /** Queries for look types used when building a character's appearance. */
  lookTypes: LookTypeQuery;
  /** Queries for in-game messages. */
  messages: MessageQuery;
  /** Queries for moves available to characters. */
  moves: MoveQuery;
  /** Queries for playable scenarios. */
  scenarios: ScenarioQuery;
};

/** A pre-written adventure scenario that can be played. */
export type Scenario = {
  __typename?: 'Scenario';
  /** A short summary of the scenario's premise. */
  description: Scalars['String']['output'];
  /** Unique key for this scenario. */
  key: Scalars['ID']['output'];
  /** Human-readable scenario title. */
  name: Scalars['String']['output'];
};

/** Namespace for scenario queries. */
export type ScenarioQuery = {
  __typename?: 'ScenarioQuery';
  /** Returns all available scenarios. */
  all: Array<Scenario>;
  /** Returns a single scenario by key, or null if not found. */
  byKey?: Maybe<Scenario>;
};


/** Namespace for scenario queries. */
export type ScenarioQueryByKeyArgs = {
  key: Scalars['ID']['input'];
};

export type GetCharacterQueryVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;


export type GetCharacterQuery = { __typename?: 'Query', characters: { __typename?: 'CharacterQuery', byId?: { __typename?: 'Character', id: string, name: string } | null } };

export type CreateCharacterMutationVariables = Exact<{
  input: CreateCharacterInput;
}>;


export type CreateCharacterMutation = { __typename?: 'Mutation', characters: { __typename?: 'CharacterMutation', create: { __typename?: 'Character', id: string, name: string } } };

export type GetCharacterClassesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCharacterClassesQuery = { __typename?: 'Query', characterClasses: { __typename?: 'CharacterClassQuery', all: Array<{ __typename?: 'CharacterClass', bonds: Array<string>, damageDie: number, hpBase: number, key: string, name: string, alignmentTemplates: Array<{ __typename?: 'AlignmentTemplate', alignment: string, description: string }>, lookExamples: Array<{ __typename?: 'LookExample', examples: Array<string>, type: string }>, raceMoves: Array<{ __typename?: 'Move', key: string, name: string, trigger: string, type: string }>, startingMoves: Array<{ __typename?: 'Move', key: string, name: string, trigger: string, type: string }> }> } };

export type GetLookTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLookTypesQuery = { __typename?: 'Query', lookTypes: { __typename?: 'LookTypeQuery', all: Array<{ __typename?: 'LookType', examples: Array<string>, key: string, name: string }> } };

export type GetMovesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMovesQuery = { __typename?: 'Query', moves: { __typename?: 'MoveQuery', all: Array<{ __typename?: 'Move', key: string, name: string, trigger: string, type: string }> } };

export type CreateGameMutationVariables = Exact<{
  characterId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  scenarioKey: Scalars['String']['input'];
}>;


export type CreateGameMutation = { __typename?: 'Mutation', games: { __typename?: 'GameMutation', create: { __typename?: 'Game', id: string, name: string } } };

export type GetScenariosQueryVariables = Exact<{ [key: string]: never; }>;


export type GetScenariosQuery = { __typename?: 'Query', scenarios: { __typename?: 'ScenarioQuery', all: Array<{ __typename?: 'Scenario', description: string, key: string, name: string }> } };

export type GetMessagesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMessagesQuery = { __typename?: 'Query', messages: { __typename?: 'MessageQuery', all: Array<{ __typename?: 'Message', author: string, content: string, datetime: any, id: any }> } };

export type SendMessageMutationVariables = Exact<{
  content: Scalars['String']['input'];
}>;


export type SendMessageMutation = { __typename?: 'Mutation', messages: { __typename?: 'MessageMutation', send: { __typename?: 'Message', author: string, content: string, datetime: any, id: any } } };

export type GetGamesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGamesQuery = { __typename?: 'Query', games: { __typename?: 'GameQuery', all: Array<{ __typename?: 'Game', id: string, name: string }> } };

export type GetCharactersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCharactersQuery = { __typename?: 'Query', characters: { __typename?: 'CharacterQuery', all: Array<{ __typename?: 'Character', id: string, name: string }> } };


export const GetCharacterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"byId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetCharacterQuery, GetCharacterQueryVariables>;
export const CreateCharacterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCharacter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCharacterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CreateCharacterMutation, CreateCharacterMutationVariables>;
export const GetCharacterClassesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacterClasses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterClasses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alignmentTemplates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alignment"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"bonds"}},{"kind":"Field","name":{"kind":"Name","value":"damageDie"}},{"kind":"Field","name":{"kind":"Name","value":"hpBase"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"lookExamples"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"examples"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"raceMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trigger"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"startingMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trigger"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetCharacterClassesQuery, GetCharacterClassesQueryVariables>;
export const GetLookTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLookTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lookTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"examples"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetLookTypesQuery, GetLookTypesQueryVariables>;
export const GetMovesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMoves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moves"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trigger"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]} as unknown as DocumentNode<GetMovesQuery, GetMovesQueryVariables>;
export const CreateGameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGame"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scenarioKey"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"games"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"create"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"characterId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"scenarioKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scenarioKey"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CreateGameMutation, CreateGameMutationVariables>;
export const GetScenariosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetScenarios"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scenarios"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetScenariosQuery, GetScenariosQueryVariables>;
export const GetMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMessages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"datetime"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<GetMessagesQuery, GetMessagesQueryVariables>;
export const SendMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"send"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"datetime"}},{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<SendMessageMutation, SendMessageMutationVariables>;
export const GetGamesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGames"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"games"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetGamesQuery, GetGamesQueryVariables>;
export const GetCharactersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"all"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetCharactersQuery, GetCharactersQueryVariables>;