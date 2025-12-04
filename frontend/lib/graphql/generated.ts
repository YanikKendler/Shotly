import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInteger: { input: any; output: any; }
  DateTime: { input: any; output: any; }
};

/** Mutation root */
export type Mutation = {
  __typename?: 'Mutation';
  createScene?: Maybe<SceneDto>;
  createSceneAttributeDefinition?: Maybe<SceneAttributeDefinitionBaseDto>;
  createSceneAttributeTemplate?: Maybe<SceneAttributeTemplateBaseDto>;
  createSceneSelectAttributeOption?: Maybe<SceneSelectAttributeOptionDefinition>;
  createSceneSelectAttributeOptionTemplate?: Maybe<SceneSelectAttributeOptionTemplate>;
  createShot?: Maybe<ShotDto>;
  createShotAttributeDefinition?: Maybe<ShotAttributeDefinitionBaseDto>;
  createShotAttributeTemplate?: Maybe<ShotAttributeTemplateBaseDto>;
  createShotSelectAttributeOption?: Maybe<ShotSelectAttributeOptionDefinition>;
  createShotSelectAttributeOptionTemplate?: Maybe<ShotSelectAttributeOptionTemplate>;
  createShotlist?: Maybe<ShotlistDto>;
  createTemplate?: Maybe<TemplateDto>;
  deleteScene?: Maybe<SceneDto>;
  deleteSceneAttributeDefinition?: Maybe<SceneAttributeDefinitionBaseDto>;
  deleteSceneAttributeTemplate?: Maybe<SceneAttributeTemplateBaseDto>;
  deleteSceneSelectAttributeOption?: Maybe<SceneSelectAttributeOptionDefinition>;
  deleteSceneSelectAttributeOptionTemplate?: Maybe<SceneSelectAttributeOptionTemplate>;
  deleteShot?: Maybe<ShotDto>;
  deleteShotAttributeDefinition?: Maybe<ShotAttributeDefinitionBaseDto>;
  deleteShotAttributeTemplate?: Maybe<ShotAttributeTemplateBaseDto>;
  deleteShotSelectAttributeOption?: Maybe<ShotSelectAttributeOptionDefinition>;
  deleteShotSelectAttributeOptionTemplate?: Maybe<ShotSelectAttributeOptionTemplate>;
  deleteShotlist?: Maybe<ShotlistDto>;
  deleteTemplate?: Maybe<TemplateDto>;
  deleteUser?: Maybe<User>;
  triggerPasswordReset?: Maybe<Scalars['String']['output']>;
  updateScene?: Maybe<SceneDto>;
  updateSceneAttribute?: Maybe<SceneAttributeBaseDto>;
  updateSceneAttributeDefinition?: Maybe<SceneAttributeDefinitionBaseDto>;
  updateSceneAttributeTemplate?: Maybe<SceneAttributeTemplateBaseDto>;
  updateSceneSelectAttributeOption?: Maybe<SceneSelectAttributeOptionDefinition>;
  updateSceneSelectAttributeOptionTemplate?: Maybe<SceneSelectAttributeOptionTemplate>;
  updateShot?: Maybe<ShotDto>;
  updateShotAttribute?: Maybe<ShotAttributeBaseDto>;
  updateShotAttributeDefinition?: Maybe<ShotAttributeDefinitionBaseDto>;
  updateShotAttributeTemplate?: Maybe<ShotAttributeTemplateBaseDto>;
  updateShotSelectAttributeOption?: Maybe<ShotSelectAttributeOptionDefinition>;
  updateShotSelectAttributeOptionTemplate?: Maybe<ShotSelectAttributeOptionTemplate>;
  updateShotlist?: Maybe<ShotlistDto>;
  updateTemplate?: Maybe<TemplateDto>;
  updateUser?: Maybe<User>;
};


/** Mutation root */
export type MutationCreateSceneArgs = {
  shotlistId?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationCreateSceneAttributeDefinitionArgs = {
  createDTO?: InputMaybe<SceneAttributeDefinitionCreateDtoInput>;
};


/** Mutation root */
export type MutationCreateSceneAttributeTemplateArgs = {
  createDTO?: InputMaybe<SceneAttributeTemplateCreateDtoInput>;
};


/** Mutation root */
export type MutationCreateSceneSelectAttributeOptionArgs = {
  createDTO?: InputMaybe<SceneSelectAttributeOptionCreateDtoInput>;
};


/** Mutation root */
export type MutationCreateSceneSelectAttributeOptionTemplateArgs = {
  attributeTemplateId?: InputMaybe<Scalars['BigInteger']['input']>;
};


/** Mutation root */
export type MutationCreateShotArgs = {
  sceneId?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationCreateShotAttributeDefinitionArgs = {
  createDTO?: InputMaybe<ShotAttributeDefinitionCreateDtoInput>;
};


/** Mutation root */
export type MutationCreateShotAttributeTemplateArgs = {
  createDTO?: InputMaybe<ShotAttributeTemplateCreateDtoInput>;
};


/** Mutation root */
export type MutationCreateShotSelectAttributeOptionArgs = {
  createDTO?: InputMaybe<ShotSelectAttributeOptionCreateDtoInput>;
};


/** Mutation root */
export type MutationCreateShotSelectAttributeOptionTemplateArgs = {
  attributeTemplateId?: InputMaybe<Scalars['BigInteger']['input']>;
};


/** Mutation root */
export type MutationCreateShotlistArgs = {
  createDTO?: InputMaybe<ShotlistCreateDtoInput>;
};


/** Mutation root */
export type MutationCreateTemplateArgs = {
  createDTO?: InputMaybe<TemplateCreateDtoInput>;
};


/** Mutation root */
export type MutationDeleteSceneArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationDeleteSceneAttributeDefinitionArgs = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
};


/** Mutation root */
export type MutationDeleteSceneAttributeTemplateArgs = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
};


/** Mutation root */
export type MutationDeleteSceneSelectAttributeOptionArgs = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
};


/** Mutation root */
export type MutationDeleteSceneSelectAttributeOptionTemplateArgs = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
};


/** Mutation root */
export type MutationDeleteShotArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationDeleteShotAttributeDefinitionArgs = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
};


/** Mutation root */
export type MutationDeleteShotAttributeTemplateArgs = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
};


/** Mutation root */
export type MutationDeleteShotSelectAttributeOptionArgs = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
};


/** Mutation root */
export type MutationDeleteShotSelectAttributeOptionTemplateArgs = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
};


/** Mutation root */
export type MutationDeleteShotlistArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationDeleteTemplateArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationUpdateSceneArgs = {
  editDTO?: InputMaybe<SceneEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateSceneAttributeArgs = {
  editDTO?: InputMaybe<SceneAttributeEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateSceneAttributeDefinitionArgs = {
  editDTO?: InputMaybe<SceneAttributeDefinitionEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateSceneAttributeTemplateArgs = {
  editDTO?: InputMaybe<SceneAttributeTemplateEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateSceneSelectAttributeOptionArgs = {
  editDTO?: InputMaybe<SceneSelectAttributeOptionEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateSceneSelectAttributeOptionTemplateArgs = {
  editDTO?: InputMaybe<SceneSelectAttributeOptionTemplateEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateShotArgs = {
  editDTO?: InputMaybe<ShotEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateShotAttributeArgs = {
  editDTO?: InputMaybe<ShotAttributeEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateShotAttributeDefinitionArgs = {
  editDTO?: InputMaybe<ShotAttributeDefinitionEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateShotAttributeTemplateArgs = {
  editDTO?: InputMaybe<ShotAttributeTemplateEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateShotSelectAttributeOptionArgs = {
  editDTO?: InputMaybe<ShotSelectAttributeOptionEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateShotSelectAttributeOptionTemplateArgs = {
  editDTO?: InputMaybe<ShotSelectAttributeOptionTemplateEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateShotlistArgs = {
  editDTO?: InputMaybe<ShotlistEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateTemplateArgs = {
  editDTO?: InputMaybe<TemplateEditDtoInput>;
};


/** Mutation root */
export type MutationUpdateUserArgs = {
  editDTO?: InputMaybe<UserEditDtoInput>;
};

/** Query root */
export type Query = {
  __typename?: 'Query';
  currentUser?: Maybe<UserDto>;
  sceneAttributeDefinitions?: Maybe<Array<Maybe<SceneAttributeDefinitionBaseDto>>>;
  sceneSelectAttributeOptions?: Maybe<Array<Maybe<SceneSelectAttributeOptionDefinition>>>;
  scenes?: Maybe<Array<Maybe<SceneDto>>>;
  searchSceneSelectAttributeOptions?: Maybe<Array<Maybe<SceneSelectAttributeOptionDefinition>>>;
  searchShotSelectAttributeOptions?: Maybe<Array<Maybe<ShotSelectAttributeOptionDefinition>>>;
  shotAttributeDefinitions?: Maybe<Array<Maybe<ShotAttributeDefinitionBaseDto>>>;
  shotSelectAttributeOptions?: Maybe<Array<Maybe<ShotSelectAttributeOptionDefinition>>>;
  shotlist?: Maybe<ShotlistDto>;
  shotlists?: Maybe<Array<Maybe<ShotlistDto>>>;
  shots?: Maybe<Array<Maybe<ShotDto>>>;
  template?: Maybe<TemplateDto>;
  templates?: Maybe<Array<Maybe<TemplateDto>>>;
};


/** Query root */
export type QuerySceneAttributeDefinitionsArgs = {
  shotlistId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QuerySceneSelectAttributeOptionsArgs = {
  attributeDefinitionId?: InputMaybe<Scalars['BigInteger']['input']>;
};


/** Query root */
export type QueryScenesArgs = {
  shotlistId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QuerySearchSceneSelectAttributeOptionsArgs = {
  searchDTO?: InputMaybe<SceneSelectAttributeOptionSearchDtoInput>;
};


/** Query root */
export type QuerySearchShotSelectAttributeOptionsArgs = {
  searchDTO?: InputMaybe<ShotSelectAttributeOptionSearchDtoInput>;
};


/** Query root */
export type QueryShotAttributeDefinitionsArgs = {
  shotlistId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryShotSelectAttributeOptionsArgs = {
  attributeDefinitionId?: InputMaybe<Scalars['BigInteger']['input']>;
};


/** Query root */
export type QueryShotlistArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryShotsArgs = {
  sceneId?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryTemplateArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};

export type Scene = {
  __typename?: 'Scene';
  attributes?: Maybe<Array<Maybe<SceneAttributeBase>>>;
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  shots?: Maybe<Array<Maybe<Shot>>>;
};

export type SceneAttributeBase = {
  __typename?: 'SceneAttributeBase';
  definition?: Maybe<SceneAttributeDefinitionBase>;
  id?: Maybe<Scalars['BigInteger']['output']>;
};

export type SceneAttributeBaseDto = {
  definition?: Maybe<SceneAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
};

export type SceneAttributeDefinitionBase = {
  __typename?: 'SceneAttributeDefinitionBase';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
};

export type SceneAttributeDefinitionBaseDto = {
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
};

export type SceneAttributeDefinitionCreateDtoInput = {
  shotlistId?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<SceneAttributeType>;
};

export type SceneAttributeDefinitionEditDtoInput = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
};

export type SceneAttributeEditDtoInput = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
  multiSelectValue?: InputMaybe<Array<InputMaybe<Scalars['BigInteger']['input']>>>;
  singleSelectValue?: InputMaybe<Scalars['BigInteger']['input']>;
  textValue?: InputMaybe<Scalars['String']['input']>;
};

export type SceneAttributeTemplateBase = {
  __typename?: 'SceneAttributeTemplateBase';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  template?: Maybe<Template>;
  type?: Maybe<Scalars['String']['output']>;
};

export type SceneAttributeTemplateBaseDto = {
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
};

export type SceneAttributeTemplateCreateDtoInput = {
  templateId?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<SceneAttributeType>;
};

export type SceneAttributeTemplateEditDtoInput = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
};

export enum SceneAttributeType {
  SceneMultiSelectAttribute = 'SceneMultiSelectAttribute',
  SceneSingleSelectAttribute = 'SceneSingleSelectAttribute',
  SceneTextAttribute = 'SceneTextAttribute'
}

export type SceneDto = {
  __typename?: 'SceneDTO';
  attributes?: Maybe<Array<Maybe<SceneAttributeBaseDto>>>;
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  shotlist?: Maybe<Shotlist>;
  shots?: Maybe<Array<Maybe<ShotDto>>>;
};

export type SceneEditDtoInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  position: Scalars['Int']['input'];
};

export type SceneMultiSelectAttributeDto = SceneAttributeBaseDto & {
  __typename?: 'SceneMultiSelectAttributeDTO';
  definition?: Maybe<SceneAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
  multiSelectValue?: Maybe<Array<Maybe<SceneSelectAttributeOptionDefinition>>>;
};

export type SceneMultiSelectAttributeDefinitionDto = SceneAttributeDefinitionBaseDto & {
  __typename?: 'SceneMultiSelectAttributeDefinitionDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<SceneSelectAttributeOptionDefinition>>>;
  position: Scalars['Int']['output'];
};

export type SceneMultiSelectAttributeTemplateDto = SceneAttributeTemplateBaseDto & {
  __typename?: 'SceneMultiSelectAttributeTemplateDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<SceneSelectAttributeOptionTemplate>>>;
  position: Scalars['Int']['output'];
};

export type SceneSelectAttributeOptionCreateDtoInput = {
  attributeDefinitionId?: InputMaybe<Scalars['BigInteger']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type SceneSelectAttributeOptionDefinition = {
  __typename?: 'SceneSelectAttributeOptionDefinition';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  sceneAttributeDefinition?: Maybe<SceneAttributeDefinitionBase>;
};

export type SceneSelectAttributeOptionEditDtoInput = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type SceneSelectAttributeOptionSearchDtoInput = {
  sceneAttributeDefinitionId?: InputMaybe<Scalars['BigInteger']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};

export type SceneSelectAttributeOptionTemplate = {
  __typename?: 'SceneSelectAttributeOptionTemplate';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  sceneAttributeTemplate?: Maybe<SceneAttributeTemplateBase>;
};

export type SceneSelectAttributeOptionTemplateEditDtoInput = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type SceneSingleSelectAttributeDto = SceneAttributeBaseDto & {
  __typename?: 'SceneSingleSelectAttributeDTO';
  definition?: Maybe<SceneAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
  singleSelectValue?: Maybe<SceneSelectAttributeOptionDefinition>;
};

export type SceneSingleSelectAttributeDefinitionDto = SceneAttributeDefinitionBaseDto & {
  __typename?: 'SceneSingleSelectAttributeDefinitionDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<SceneSelectAttributeOptionDefinition>>>;
  position: Scalars['Int']['output'];
};

export type SceneSingleSelectAttributeTemplateDto = SceneAttributeTemplateBaseDto & {
  __typename?: 'SceneSingleSelectAttributeTemplateDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<SceneSelectAttributeOptionTemplate>>>;
  position: Scalars['Int']['output'];
};

export type SceneTextAttributeDto = SceneAttributeBaseDto & {
  __typename?: 'SceneTextAttributeDTO';
  definition?: Maybe<SceneAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
  textValue?: Maybe<Scalars['String']['output']>;
};

export type SceneTextAttributeDefinitionDto = SceneAttributeDefinitionBaseDto & {
  __typename?: 'SceneTextAttributeDefinitionDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
};

export type SceneTextAttributeTemplateDto = SceneAttributeTemplateBaseDto & {
  __typename?: 'SceneTextAttributeTemplateDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
};

export type Shot = {
  __typename?: 'Shot';
  attributes?: Maybe<Array<Maybe<ShotAttributeBase>>>;
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  isSubshot: Scalars['Boolean']['output'];
  position: Scalars['Int']['output'];
};

export type ShotAttributeBase = {
  __typename?: 'ShotAttributeBase';
  definition?: Maybe<ShotAttributeDefinitionBase>;
  id?: Maybe<Scalars['BigInteger']['output']>;
};

export type ShotAttributeBaseDto = {
  definition?: Maybe<ShotAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
};

export type ShotAttributeDefinitionBase = {
  __typename?: 'ShotAttributeDefinitionBase';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
};

export type ShotAttributeDefinitionBaseDto = {
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
};

export type ShotAttributeDefinitionCreateDtoInput = {
  shotlistId?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<ShotAttributeType>;
};

export type ShotAttributeDefinitionEditDtoInput = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
};

export type ShotAttributeEditDtoInput = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
  multiSelectValue?: InputMaybe<Array<InputMaybe<Scalars['BigInteger']['input']>>>;
  singleSelectValue?: InputMaybe<Scalars['BigInteger']['input']>;
  textValue?: InputMaybe<Scalars['String']['input']>;
};

export type ShotAttributeTemplateBase = {
  __typename?: 'ShotAttributeTemplateBase';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  template?: Maybe<Template>;
  type?: Maybe<Scalars['String']['output']>;
};

export type ShotAttributeTemplateBaseDto = {
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
};

export type ShotAttributeTemplateCreateDtoInput = {
  templateId?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<ShotAttributeType>;
};

export type ShotAttributeTemplateEditDtoInput = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
};

export enum ShotAttributeType {
  ShotMultiSelectAttribute = 'ShotMultiSelectAttribute',
  ShotSingleSelectAttribute = 'ShotSingleSelectAttribute',
  ShotTextAttribute = 'ShotTextAttribute'
}

export type ShotDto = {
  __typename?: 'ShotDTO';
  attributes?: Maybe<Array<Maybe<ShotAttributeBaseDto>>>;
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  scene?: Maybe<Scene>;
  subshot: Scalars['Boolean']['output'];
};

export type ShotEditDtoInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  position: Scalars['Int']['input'];
};

export type ShotMultiSelectAttributeDto = ShotAttributeBaseDto & {
  __typename?: 'ShotMultiSelectAttributeDTO';
  definition?: Maybe<ShotAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
  multiSelectValue?: Maybe<Array<Maybe<ShotSelectAttributeOptionDefinition>>>;
};

export type ShotMultiSelectAttributeDefinitionDto = ShotAttributeDefinitionBaseDto & {
  __typename?: 'ShotMultiSelectAttributeDefinitionDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<ShotSelectAttributeOptionDefinition>>>;
  position: Scalars['Int']['output'];
};

export type ShotMultiSelectAttributeTemplateDto = ShotAttributeTemplateBaseDto & {
  __typename?: 'ShotMultiSelectAttributeTemplateDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<ShotSelectAttributeOptionTemplate>>>;
  position: Scalars['Int']['output'];
};

export type ShotSelectAttributeOptionCreateDtoInput = {
  attributeDefinitionId?: InputMaybe<Scalars['BigInteger']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type ShotSelectAttributeOptionDefinition = {
  __typename?: 'ShotSelectAttributeOptionDefinition';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  shotAttributeDefinition?: Maybe<ShotAttributeDefinitionBase>;
};

export type ShotSelectAttributeOptionEditDtoInput = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type ShotSelectAttributeOptionSearchDtoInput = {
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  shotAttributeDefinitionId?: InputMaybe<Scalars['BigInteger']['input']>;
};

export type ShotSelectAttributeOptionTemplate = {
  __typename?: 'ShotSelectAttributeOptionTemplate';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  shotAttributeTemplate?: Maybe<ShotAttributeTemplateBase>;
};

export type ShotSelectAttributeOptionTemplateEditDtoInput = {
  id?: InputMaybe<Scalars['BigInteger']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type ShotSingleSelectAttributeDto = ShotAttributeBaseDto & {
  __typename?: 'ShotSingleSelectAttributeDTO';
  definition?: Maybe<ShotAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
  singleSelectValue?: Maybe<ShotSelectAttributeOptionDefinition>;
};

export type ShotSingleSelectAttributeDefinitionDto = ShotAttributeDefinitionBaseDto & {
  __typename?: 'ShotSingleSelectAttributeDefinitionDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<ShotSelectAttributeOptionDefinition>>>;
  position: Scalars['Int']['output'];
};

export type ShotSingleSelectAttributeTemplateDto = ShotAttributeTemplateBaseDto & {
  __typename?: 'ShotSingleSelectAttributeTemplateDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<ShotSelectAttributeOptionTemplate>>>;
  position: Scalars['Int']['output'];
};

export type ShotTextAttributeDto = ShotAttributeBaseDto & {
  __typename?: 'ShotTextAttributeDTO';
  definition?: Maybe<ShotAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
  textValue?: Maybe<Scalars['String']['output']>;
};

export type ShotTextAttributeDefinitionDto = ShotAttributeDefinitionBaseDto & {
  __typename?: 'ShotTextAttributeDefinitionDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
};

export type ShotTextAttributeTemplateDto = ShotAttributeTemplateBaseDto & {
  __typename?: 'ShotTextAttributeTemplateDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
};

export type Shotlist = {
  __typename?: 'Shotlist';
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** ISO-8601 */
  editedAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  sceneAttributeDefinitions?: Maybe<Array<Maybe<SceneAttributeDefinitionBase>>>;
  scenes?: Maybe<Array<Maybe<Scene>>>;
  shotAttributeDefinitions?: Maybe<Array<Maybe<ShotAttributeDefinitionBase>>>;
  template?: Maybe<Template>;
};

export type ShotlistCreateDtoInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  templateId?: InputMaybe<Scalars['String']['input']>;
};

export type ShotlistDto = {
  __typename?: 'ShotlistDTO';
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** ISO-8601 */
  editedAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<UserDto>;
  sceneAttributeDefinitions?: Maybe<Array<Maybe<SceneAttributeDefinitionBase>>>;
  sceneCount?: Maybe<Scalars['Int']['output']>;
  scenes?: Maybe<Array<Maybe<SceneDto>>>;
  shotAttributeDefinitions?: Maybe<Array<Maybe<ShotAttributeDefinitionBaseDto>>>;
  shotCount?: Maybe<Scalars['Int']['output']>;
  template?: Maybe<Template>;
};

export type ShotlistEditDtoInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Template = {
  __typename?: 'Template';
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  sceneAttributes?: Maybe<Array<Maybe<SceneAttributeTemplateBase>>>;
  shotAttributes?: Maybe<Array<Maybe<ShotAttributeTemplateBase>>>;
};

export type TemplateCreateDtoInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type TemplateDto = {
  __typename?: 'TemplateDTO';
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<UserDto>;
  sceneAttributeCount?: Maybe<Scalars['Int']['output']>;
  sceneAttributes?: Maybe<Array<Maybe<SceneAttributeTemplateBaseDto>>>;
  shotAttributeCount?: Maybe<Scalars['Int']['output']>;
  shotAttributes?: Maybe<Array<Maybe<ShotAttributeTemplateBaseDto>>>;
};

export type TemplateEditDtoInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  auth0Sub?: Maybe<Scalars['String']['output']>;
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  hasCancelled: Scalars['Boolean']['output'];
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  shotlists?: Maybe<Array<Maybe<Shotlist>>>;
  stripeCustomerId?: Maybe<Scalars['String']['output']>;
  templates?: Maybe<Array<Maybe<Template>>>;
  tier?: Maybe<UserTier>;
};

export type UserDto = {
  __typename?: 'UserDTO';
  auth0Sub?: Maybe<Scalars['String']['output']>;
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  hasCancelled: Scalars['Boolean']['output'];
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  shotlistCount: Scalars['Int']['output'];
  shotlists?: Maybe<Array<Maybe<Shotlist>>>;
  stripeCustomerId?: Maybe<Scalars['String']['output']>;
  templateCount: Scalars['Int']['output'];
  templates?: Maybe<Array<Maybe<Template>>>;
  tier?: Maybe<UserTier>;
};

export type UserEditDtoInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export enum UserTier {
  Basic = 'BASIC',
  Pro = 'PRO'
}

export type HomeQueryVariables = Exact<{ [key: string]: never; }>;


export type HomeQuery = { __typename?: 'Query', shotlists?: Array<{ __typename?: 'ShotlistDTO', id?: string | null, name?: string | null, sceneCount?: number | null, shotCount?: number | null, editedAt?: any | null } | null> | null, templates?: Array<{ __typename?: 'TemplateDTO', id?: string | null, name?: string | null } | null> | null };

export type DashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardQuery = { __typename?: 'Query', shotlists?: Array<{ __typename?: 'ShotlistDTO', id?: string | null, name?: string | null, sceneCount?: number | null, shotCount?: number | null, editedAt?: any | null, owner?: { __typename?: 'UserDTO', name?: string | null } | null } | null> | null, templates?: Array<{ __typename?: 'TemplateDTO', id?: string | null, name?: string | null, shotAttributeCount?: number | null, sceneAttributeCount?: number | null, owner?: { __typename?: 'UserDTO', name?: string | null } | null } | null> | null };

export type TemplateQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type TemplateQuery = { __typename?: 'Query', template?: { __typename?: 'TemplateDTO', id?: string | null, name?: string | null, shotAttributes?: Array<{ __typename: 'ShotMultiSelectAttributeTemplateDTO', id?: any | null, name?: string | null, position: number, options?: Array<{ __typename?: 'ShotSelectAttributeOptionTemplate', id?: any | null, name?: string | null } | null> | null } | { __typename: 'ShotSingleSelectAttributeTemplateDTO', id?: any | null, name?: string | null, position: number, options?: Array<{ __typename?: 'ShotSelectAttributeOptionTemplate', id?: any | null, name?: string | null } | null> | null } | { __typename: 'ShotTextAttributeTemplateDTO', id?: any | null, name?: string | null, position: number } | null> | null, sceneAttributes?: Array<{ __typename: 'SceneMultiSelectAttributeTemplateDTO', id?: any | null, name?: string | null, position: number, options?: Array<{ __typename?: 'SceneSelectAttributeOptionTemplate', id?: any | null, name?: string | null } | null> | null } | { __typename: 'SceneSingleSelectAttributeTemplateDTO', id?: any | null, name?: string | null, position: number, options?: Array<{ __typename?: 'SceneSelectAttributeOptionTemplate', id?: any | null, name?: string | null } | null> | null } | { __typename: 'SceneTextAttributeTemplateDTO', id?: any | null, name?: string | null, position: number } | null> | null } | null };

export type UpdateTemplateMutationVariables = Exact<{
  templateId: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateTemplateMutation = { __typename?: 'Mutation', updateTemplate?: { __typename?: 'TemplateDTO', id?: string | null, name?: string | null } | null };

export type DeleteTemplateMutationVariables = Exact<{
  templateId: Scalars['String']['input'];
}>;


export type DeleteTemplateMutation = { __typename?: 'Mutation', deleteTemplate?: { __typename?: 'TemplateDTO', id?: string | null } | null };

export type CreateShotAttributeTemplateMutationVariables = Exact<{
  templateId: Scalars['String']['input'];
  attributeType: ShotAttributeType;
}>;


export type CreateShotAttributeTemplateMutation = { __typename?: 'Mutation', createShotAttributeTemplate?: { __typename?: 'ShotMultiSelectAttributeTemplateDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotSingleSelectAttributeTemplateDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotTextAttributeTemplateDTO', id?: any | null, name?: string | null, position: number } | null };

export type UpdateShotAttributeTemplatePositionMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  position: Scalars['Int']['input'];
}>;


export type UpdateShotAttributeTemplatePositionMutation = { __typename?: 'Mutation', updateShotAttributeTemplate?: { __typename?: 'ShotMultiSelectAttributeTemplateDTO', id?: any | null, position: number } | { __typename?: 'ShotSingleSelectAttributeTemplateDTO', id?: any | null, position: number } | { __typename?: 'ShotTextAttributeTemplateDTO', id?: any | null, position: number } | null };

export type CreateSceneAttributeTemplateMutationVariables = Exact<{
  templateId: Scalars['String']['input'];
  attributeType: SceneAttributeType;
}>;


export type CreateSceneAttributeTemplateMutation = { __typename?: 'Mutation', createSceneAttributeTemplate?: { __typename?: 'SceneMultiSelectAttributeTemplateDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneSingleSelectAttributeTemplateDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneTextAttributeTemplateDTO', id?: any | null, name?: string | null, position: number } | null };

export type UpdateSceneAttributeTemplatePositionMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  position: Scalars['Int']['input'];
}>;


export type UpdateSceneAttributeTemplatePositionMutation = { __typename?: 'Mutation', updateSceneAttributeTemplate?: { __typename?: 'SceneMultiSelectAttributeTemplateDTO', id?: any | null, position: number } | { __typename?: 'SceneSingleSelectAttributeTemplateDTO', id?: any | null, position: number } | { __typename?: 'SceneTextAttributeTemplateDTO', id?: any | null, position: number } | null };

export type CheckCurrentUserTierQueryVariables = Exact<{ [key: string]: never; }>;


export type CheckCurrentUserTierQuery = { __typename?: 'Query', currentUser?: { __typename?: 'UserDTO', id?: string | null, tier?: UserTier | null, hasCancelled: boolean } | null };

export type GetShotSelectAttributeOptionsQueryVariables = Exact<{
  definitionId: Scalars['BigInteger']['input'];
}>;


export type GetShotSelectAttributeOptionsQuery = { __typename?: 'Query', shotSelectAttributeOptions?: Array<{ __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null };

export type ShotlistQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type ShotlistQuery = { __typename?: 'Query', shotlist?: { __typename?: 'ShotlistDTO', id?: string | null, name?: string | null, scenes?: Array<{ __typename?: 'SceneDTO', id?: string | null, position: number, attributes?: Array<{ __typename?: 'SceneMultiSelectAttributeDTO', id?: any | null, multiSelectValue?: Array<{ __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null, definition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | { __typename?: 'SceneSingleSelectAttributeDTO', id?: any | null, singleSelectValue?: { __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null, definition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | { __typename?: 'SceneTextAttributeDTO', textValue?: string | null, id?: any | null, definition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | null> | null } | null> | null, sceneAttributeDefinitions?: Array<{ __typename?: 'SceneAttributeDefinitionBase', id?: any | null, name?: string | null, position: number } | null> | null, shotAttributeDefinitions?: Array<{ __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null> | null, owner?: { __typename?: 'UserDTO', id?: string | null, tier?: UserTier | null, shotlistCount: number } | null } | null };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', currentUser?: { __typename?: 'UserDTO', id?: string | null, name?: string | null, email?: string | null, createdAt?: any | null, tier?: UserTier | null, hasCancelled: boolean, shotlists?: Array<{ __typename?: 'Shotlist', name?: string | null } | null> | null } | null };

export type TriggerPasswordResetMutationVariables = Exact<{ [key: string]: never; }>;


export type TriggerPasswordResetMutation = { __typename?: 'Mutation', triggerPasswordReset?: string | null };

export type DeleteUserMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser?: { __typename?: 'User', id?: string | null } | null };

export type CreateShotlistDataQueryVariables = Exact<{ [key: string]: never; }>;


export type CreateShotlistDataQuery = { __typename?: 'Query', templates?: Array<{ __typename?: 'TemplateDTO', id?: string | null, name?: string | null } | null> | null, currentUser?: { __typename?: 'UserDTO', tier?: UserTier | null, shotlistCount: number } | null };

export type CreateShotlistMutationVariables = Exact<{
  name: Scalars['String']['input'];
  templateId?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateShotlistMutation = { __typename?: 'Mutation', createShotlist?: { __typename?: 'ShotlistDTO', id?: string | null } | null };

export type CreateTemplateMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateTemplateMutation = { __typename?: 'Mutation', createTemplate?: { __typename?: 'TemplateDTO', id?: string | null } | null };

export type CreateShotAttributeDefinitionMutationVariables = Exact<{
  shotlistId: Scalars['String']['input'];
  attributeType: ShotAttributeType;
}>;


export type CreateShotAttributeDefinitionMutation = { __typename?: 'Mutation', createShotAttributeDefinition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null };

export type UpdateShotDefinitionMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  position: Scalars['Int']['input'];
}>;


export type UpdateShotDefinitionMutation = { __typename?: 'Mutation', updateShotAttributeDefinition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, position: number } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, position: number } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, position: number } | null };

export type CreateSceneAttributeDefinitionMutationVariables = Exact<{
  shotlistId: Scalars['String']['input'];
  attributeType: SceneAttributeType;
}>;


export type CreateSceneAttributeDefinitionMutation = { __typename?: 'Mutation', createSceneAttributeDefinition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null };

export type UpdateSceneDefinitionMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  position: Scalars['Int']['input'];
}>;


export type UpdateSceneDefinitionMutation = { __typename?: 'Mutation', updateSceneAttributeDefinition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null, position: number } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null, position: number } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null, position: number } | null };

export type UpdateSceneAttributeDefinitionMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateSceneAttributeDefinitionMutation = { __typename?: 'Mutation', updateSceneAttributeDefinition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null } | null };

export type DeleteSceneAttributeDefinitionMutationVariables = Exact<{
  definitionId: Scalars['BigInteger']['input'];
}>;


export type DeleteSceneAttributeDefinitionMutation = { __typename?: 'Mutation', deleteSceneAttributeDefinition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null } | null };

export type CreateSceneSelectAttributeOptionMutationVariables = Exact<{
  definitionId: Scalars['BigInteger']['input'];
}>;


export type CreateSceneSelectAttributeOptionMutation = { __typename?: 'Mutation', createSceneSelectAttributeOption?: { __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null };

export type DeleteSceneSelectAttributeOptionMutationVariables = Exact<{
  optionId: Scalars['BigInteger']['input'];
}>;


export type DeleteSceneSelectAttributeOptionMutation = { __typename?: 'Mutation', deleteSceneSelectAttributeOption?: { __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null } | null };

export type UpdateSceneSelectAttributeOptionMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateSceneSelectAttributeOptionMutation = { __typename?: 'Mutation', updateSceneSelectAttributeOption?: { __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null } | null };

export type UpdateShotAttributeDefinitionMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateShotAttributeDefinitionMutation = { __typename?: 'Mutation', updateShotAttributeDefinition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null } | null };

export type DeleteShotAttributeDefinitionMutationVariables = Exact<{
  definitionId: Scalars['BigInteger']['input'];
}>;


export type DeleteShotAttributeDefinitionMutation = { __typename?: 'Mutation', deleteShotAttributeDefinition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null } | null };

export type CreateShotSelectAttributeOptionMutationVariables = Exact<{
  definitionId: Scalars['BigInteger']['input'];
}>;


export type CreateShotSelectAttributeOptionMutation = { __typename?: 'Mutation', createShotSelectAttributeOption?: { __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null };

export type DeleteShotSelectAttributeOptionMutationVariables = Exact<{
  optionId: Scalars['BigInteger']['input'];
}>;


export type DeleteShotSelectAttributeOptionMutation = { __typename?: 'Mutation', deleteShotSelectAttributeOption?: { __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null } | null };

export type UpdateShotSelectAttributeOptionMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateShotSelectAttributeOptionMutation = { __typename?: 'Mutation', updateShotSelectAttributeOption?: { __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null } | null };

export type ShotlistForExportQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type ShotlistForExportQuery = { __typename?: 'Query', shotlist?: { __typename?: 'ShotlistDTO', id?: string | null, name?: string | null, scenes?: Array<{ __typename?: 'SceneDTO', id?: string | null, position: number, attributes?: Array<{ __typename?: 'SceneMultiSelectAttributeDTO', id?: any | null, multiSelectValue?: Array<{ __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null, definition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | { __typename?: 'SceneSingleSelectAttributeDTO', id?: any | null, singleSelectValue?: { __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null, definition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | { __typename?: 'SceneTextAttributeDTO', textValue?: string | null, id?: any | null, definition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | null> | null, shots?: Array<{ __typename?: 'ShotDTO', id?: string | null, position: number, attributes?: Array<{ __typename?: 'ShotMultiSelectAttributeDTO', id?: any | null, multiSelectValue?: Array<{ __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null, definition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | { __typename?: 'ShotSingleSelectAttributeDTO', id?: any | null, singleSelectValue?: { __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null, definition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | { __typename?: 'ShotTextAttributeDTO', textValue?: string | null, id?: any | null, definition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | null> | null } | null> | null } | null> | null, sceneAttributeDefinitions?: Array<{ __typename?: 'SceneAttributeDefinitionBase', id?: any | null, name?: string | null } | null> | null, shotAttributeDefinitions?: Array<{ __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null } | null> | null } | null };

export type UpdateShotlistNameMutationVariables = Exact<{
  shotlistId: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateShotlistNameMutation = { __typename?: 'Mutation', updateShotlist?: { __typename?: 'ShotlistDTO', id?: string | null, name?: string | null } | null };

export type DeleteShotlistMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteShotlistMutation = { __typename?: 'Mutation', deleteShotlist?: { __typename?: 'ShotlistDTO', id?: string | null } | null };

export type DataQueryVariables = Exact<{
  shotlistId: Scalars['String']['input'];
}>;


export type DataQuery = { __typename?: 'Query', shotlist?: { __typename?: 'ShotlistDTO', id?: string | null, name?: string | null, sceneCount?: number | null, shotCount?: number | null, editedAt?: any | null, createdAt?: any | null, owner?: { __typename?: 'UserDTO', name?: string | null, tier?: UserTier | null, shotlistCount: number } | null } | null, shotAttributeDefinitions?: Array<{ __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number, options?: Array<{ __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number, options?: Array<{ __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null> | null, sceneAttributeDefinitions?: Array<{ __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number, options?: Array<{ __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number, options?: Array<{ __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null> | null };

export type DeleteShotMutationVariables = Exact<{
  shotId: Scalars['String']['input'];
}>;


export type DeleteShotMutation = { __typename?: 'Mutation', deleteShot?: { __typename?: 'ShotDTO', id?: string | null } | null };

export type SearchShotSelectAttributeOptionsQueryVariables = Exact<{
  definitionId: Scalars['BigInteger']['input'];
  searchTerm: Scalars['String']['input'];
}>;


export type SearchShotSelectAttributeOptionsQuery = { __typename?: 'Query', searchShotSelectAttributeOptions?: Array<{ __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null };

export type CreateShotOptionMutationVariables = Exact<{
  definitionId: Scalars['BigInteger']['input'];
  name: Scalars['String']['input'];
}>;


export type CreateShotOptionMutation = { __typename?: 'Mutation', createShotSelectAttributeOption?: { __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null };

export type ShotsQueryVariables = Exact<{
  sceneId: Scalars['String']['input'];
}>;


export type ShotsQuery = { __typename?: 'Query', shots?: Array<{ __typename?: 'ShotDTO', id?: string | null, position: number, attributes?: Array<{ __typename?: 'ShotMultiSelectAttributeDTO', id?: any | null, multiSelectValue?: Array<{ __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null, definition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | { __typename?: 'ShotSingleSelectAttributeDTO', id?: any | null, singleSelectValue?: { __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null, definition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | { __typename?: 'ShotTextAttributeDTO', textValue?: string | null, id?: any | null, definition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | null> | null } | null> | null };

export type CreateShotMutationVariables = Exact<{
  sceneId: Scalars['String']['input'];
}>;


export type CreateShotMutation = { __typename?: 'Mutation', createShot?: { __typename?: 'ShotDTO', id?: string | null, position: number, attributes?: Array<{ __typename?: 'ShotMultiSelectAttributeDTO', id?: any | null, multiSelectValue?: Array<{ __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null, definition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | { __typename?: 'ShotSingleSelectAttributeDTO', id?: any | null, singleSelectValue?: { __typename?: 'ShotSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null, definition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | { __typename?: 'ShotTextAttributeDTO', textValue?: string | null, id?: any | null, definition?: { __typename?: 'ShotMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'ShotTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | null> | null } | null };

export type SearchSceneSelectAttributeOptionsQueryVariables = Exact<{
  definitionId: Scalars['BigInteger']['input'];
  searchTerm: Scalars['String']['input'];
}>;


export type SearchSceneSelectAttributeOptionsQuery = { __typename?: 'Query', searchSceneSelectAttributeOptions?: Array<{ __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null };

export type CreateSceneOptionMutationVariables = Exact<{
  definitionId: Scalars['BigInteger']['input'];
  name: Scalars['String']['input'];
}>;


export type CreateSceneOptionMutation = { __typename?: 'Mutation', createSceneSelectAttributeOption?: { __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null };

export type UpdateSceneAttributeMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  textValue?: InputMaybe<Scalars['String']['input']>;
  singleSelectValue?: InputMaybe<Scalars['BigInteger']['input']>;
  multiSelectValue?: InputMaybe<Array<InputMaybe<Scalars['BigInteger']['input']>> | InputMaybe<Scalars['BigInteger']['input']>>;
}>;


export type UpdateSceneAttributeMutation = { __typename?: 'Mutation', updateSceneAttribute?: { __typename?: 'SceneMultiSelectAttributeDTO', id?: any | null } | { __typename?: 'SceneSingleSelectAttributeDTO', id?: any | null } | { __typename?: 'SceneTextAttributeDTO', id?: any | null } | null };

export type UpdateShotlistMutationVariables = Exact<{
  shotlistId: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateShotlistMutation = { __typename?: 'Mutation', updateShotlist?: { __typename?: 'ShotlistDTO', id?: string | null, name?: string | null } | null };

export type UpdateSceneMutationVariables = Exact<{
  id: Scalars['String']['input'];
  position: Scalars['Int']['input'];
}>;


export type UpdateSceneMutation = { __typename?: 'Mutation', updateScene?: { __typename?: 'SceneDTO', id?: string | null, position: number } | null };

export type CreateSceneMutationVariables = Exact<{
  shotlistId: Scalars['String']['input'];
}>;


export type CreateSceneMutation = { __typename?: 'Mutation', createScene?: { __typename?: 'SceneDTO', id?: string | null, position: number, attributes?: Array<{ __typename?: 'SceneMultiSelectAttributeDTO', id?: any | null, multiSelectValue?: Array<{ __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null> | null, definition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | { __typename?: 'SceneSingleSelectAttributeDTO', id?: any | null, singleSelectValue?: { __typename?: 'SceneSelectAttributeOptionDefinition', id?: any | null, name?: string | null } | null, definition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | { __typename?: 'SceneTextAttributeDTO', textValue?: string | null, id?: any | null, definition?: { __typename?: 'SceneMultiSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneSingleSelectAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | { __typename?: 'SceneTextAttributeDefinitionDTO', id?: any | null, name?: string | null, position: number } | null } | null> | null } | null };

export type DeleteSceneMutationVariables = Exact<{
  sceneId: Scalars['String']['input'];
}>;


export type DeleteSceneMutation = { __typename?: 'Mutation', deleteScene?: { __typename?: 'SceneDTO', id?: string | null } | null };

export type UpdateSceneAttributeTemplateNameMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateSceneAttributeTemplateNameMutation = { __typename?: 'Mutation', updateSceneAttributeTemplate?: { __typename?: 'SceneMultiSelectAttributeTemplateDTO', id?: any | null } | { __typename?: 'SceneSingleSelectAttributeTemplateDTO', id?: any | null } | { __typename?: 'SceneTextAttributeTemplateDTO', id?: any | null } | null };

export type DeleteSceneAttributeTemplateMutationVariables = Exact<{
  definitionId: Scalars['BigInteger']['input'];
}>;


export type DeleteSceneAttributeTemplateMutation = { __typename?: 'Mutation', deleteSceneAttributeTemplate?: { __typename?: 'SceneMultiSelectAttributeTemplateDTO', id?: any | null } | { __typename?: 'SceneSingleSelectAttributeTemplateDTO', id?: any | null } | { __typename?: 'SceneTextAttributeTemplateDTO', id?: any | null } | null };

export type CreateSceneSelectAttributeOptionTemplateMutationVariables = Exact<{
  templateId: Scalars['BigInteger']['input'];
}>;


export type CreateSceneSelectAttributeOptionTemplateMutation = { __typename?: 'Mutation', createSceneSelectAttributeOptionTemplate?: { __typename?: 'SceneSelectAttributeOptionTemplate', id?: any | null, name?: string | null } | null };

export type DeleteSceneSelectAttributeOptionTemplateMutationVariables = Exact<{
  optionId: Scalars['BigInteger']['input'];
}>;


export type DeleteSceneSelectAttributeOptionTemplateMutation = { __typename?: 'Mutation', deleteSceneSelectAttributeOptionTemplate?: { __typename?: 'SceneSelectAttributeOptionTemplate', id?: any | null } | null };

export type UpdateSceneSelectAttributeOptionTemplateMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateSceneSelectAttributeOptionTemplateMutation = { __typename?: 'Mutation', updateSceneSelectAttributeOptionTemplate?: { __typename?: 'SceneSelectAttributeOptionTemplate', id?: any | null } | null };

export type UpdateShotAttributeTemplateNameMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateShotAttributeTemplateNameMutation = { __typename?: 'Mutation', updateShotAttributeTemplate?: { __typename?: 'ShotMultiSelectAttributeTemplateDTO', id?: any | null } | { __typename?: 'ShotSingleSelectAttributeTemplateDTO', id?: any | null } | { __typename?: 'ShotTextAttributeTemplateDTO', id?: any | null } | null };

export type DeleteShotAttributeTemplateMutationVariables = Exact<{
  definitionId: Scalars['BigInteger']['input'];
}>;


export type DeleteShotAttributeTemplateMutation = { __typename?: 'Mutation', deleteShotAttributeTemplate?: { __typename?: 'ShotMultiSelectAttributeTemplateDTO', id?: any | null } | { __typename?: 'ShotSingleSelectAttributeTemplateDTO', id?: any | null } | { __typename?: 'ShotTextAttributeTemplateDTO', id?: any | null } | null };

export type CreateShotSelectAttributeOptionTemplateMutationVariables = Exact<{
  templateId: Scalars['BigInteger']['input'];
}>;


export type CreateShotSelectAttributeOptionTemplateMutation = { __typename?: 'Mutation', createShotSelectAttributeOptionTemplate?: { __typename?: 'ShotSelectAttributeOptionTemplate', id?: any | null, name?: string | null } | null };

export type DeleteShotSelectAttributeOptionTemplateMutationVariables = Exact<{
  optionId: Scalars['BigInteger']['input'];
}>;


export type DeleteShotSelectAttributeOptionTemplateMutation = { __typename?: 'Mutation', deleteShotSelectAttributeOptionTemplate?: { __typename?: 'ShotSelectAttributeOptionTemplate', id?: any | null } | null };

export type UpdateShotSelectAttributeOptionTemplateMutationVariables = Exact<{
  id: Scalars['BigInteger']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateShotSelectAttributeOptionTemplateMutation = { __typename?: 'Mutation', updateShotSelectAttributeOptionTemplate?: { __typename?: 'ShotSelectAttributeOptionTemplate', id?: any | null } | null };


export const HomeDocument = gql`
    query home {
  shotlists {
    id
    name
    sceneCount
    shotCount
    editedAt
  }
  templates {
    id
    name
  }
}
    `;

/**
 * __useHomeQuery__
 *
 * To run a query within a React component, call `useHomeQuery` and pass it any options that fit your needs.
 * When your component renders, `useHomeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHomeQuery({
 *   variables: {
 *   },
 * });
 */
export function useHomeQuery(baseOptions?: Apollo.QueryHookOptions<HomeQuery, HomeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<HomeQuery, HomeQueryVariables>(HomeDocument, options);
      }
export function useHomeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HomeQuery, HomeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<HomeQuery, HomeQueryVariables>(HomeDocument, options);
        }
export function useHomeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<HomeQuery, HomeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<HomeQuery, HomeQueryVariables>(HomeDocument, options);
        }
export type HomeQueryHookResult = ReturnType<typeof useHomeQuery>;
export type HomeLazyQueryHookResult = ReturnType<typeof useHomeLazyQuery>;
export type HomeSuspenseQueryHookResult = ReturnType<typeof useHomeSuspenseQuery>;
export type HomeQueryResult = Apollo.QueryResult<HomeQuery, HomeQueryVariables>;
export const DashboardDocument = gql`
    query dashboard {
  shotlists {
    id
    name
    sceneCount
    shotCount
    editedAt
    owner {
      name
    }
  }
  templates {
    id
    name
    shotAttributeCount
    sceneAttributeCount
    owner {
      name
    }
  }
}
    `;

/**
 * __useDashboardQuery__
 *
 * To run a query within a React component, call `useDashboardQuery` and pass it any options that fit your needs.
 * When your component renders, `useDashboardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDashboardQuery({
 *   variables: {
 *   },
 * });
 */
export function useDashboardQuery(baseOptions?: Apollo.QueryHookOptions<DashboardQuery, DashboardQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DashboardQuery, DashboardQueryVariables>(DashboardDocument, options);
      }
export function useDashboardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DashboardQuery, DashboardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DashboardQuery, DashboardQueryVariables>(DashboardDocument, options);
        }
export function useDashboardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DashboardQuery, DashboardQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DashboardQuery, DashboardQueryVariables>(DashboardDocument, options);
        }
export type DashboardQueryHookResult = ReturnType<typeof useDashboardQuery>;
export type DashboardLazyQueryHookResult = ReturnType<typeof useDashboardLazyQuery>;
export type DashboardSuspenseQueryHookResult = ReturnType<typeof useDashboardSuspenseQuery>;
export type DashboardQueryResult = Apollo.QueryResult<DashboardQuery, DashboardQueryVariables>;
export const TemplateDocument = gql`
    query template($id: String!) {
  template(id: $id) {
    id
    name
    shotAttributes {
      id
      name
      position
      __typename
      ... on ShotSingleSelectAttributeTemplateDTO {
        options {
          id
          name
        }
      }
      ... on ShotMultiSelectAttributeTemplateDTO {
        options {
          id
          name
        }
      }
    }
    sceneAttributes {
      id
      name
      position
      __typename
      ... on SceneSingleSelectAttributeTemplateDTO {
        options {
          id
          name
        }
      }
      ... on SceneMultiSelectAttributeTemplateDTO {
        options {
          id
          name
        }
      }
    }
  }
}
    `;

/**
 * __useTemplateQuery__
 *
 * To run a query within a React component, call `useTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTemplateQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useTemplateQuery(baseOptions: Apollo.QueryHookOptions<TemplateQuery, TemplateQueryVariables> & ({ variables: TemplateQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TemplateQuery, TemplateQueryVariables>(TemplateDocument, options);
      }
export function useTemplateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TemplateQuery, TemplateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TemplateQuery, TemplateQueryVariables>(TemplateDocument, options);
        }
export function useTemplateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TemplateQuery, TemplateQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TemplateQuery, TemplateQueryVariables>(TemplateDocument, options);
        }
export type TemplateQueryHookResult = ReturnType<typeof useTemplateQuery>;
export type TemplateLazyQueryHookResult = ReturnType<typeof useTemplateLazyQuery>;
export type TemplateSuspenseQueryHookResult = ReturnType<typeof useTemplateSuspenseQuery>;
export type TemplateQueryResult = Apollo.QueryResult<TemplateQuery, TemplateQueryVariables>;
export const UpdateTemplateDocument = gql`
    mutation updateTemplate($templateId: String!, $name: String!) {
  updateTemplate(editDTO: {id: $templateId, name: $name}) {
    id
    name
  }
}
    `;
export type UpdateTemplateMutationFn = Apollo.MutationFunction<UpdateTemplateMutation, UpdateTemplateMutationVariables>;

/**
 * __useUpdateTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTemplateMutation, { data, loading, error }] = useUpdateTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateTemplateMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTemplateMutation, UpdateTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTemplateMutation, UpdateTemplateMutationVariables>(UpdateTemplateDocument, options);
      }
export type UpdateTemplateMutationHookResult = ReturnType<typeof useUpdateTemplateMutation>;
export type UpdateTemplateMutationResult = Apollo.MutationResult<UpdateTemplateMutation>;
export type UpdateTemplateMutationOptions = Apollo.BaseMutationOptions<UpdateTemplateMutation, UpdateTemplateMutationVariables>;
export const DeleteTemplateDocument = gql`
    mutation deleteTemplate($templateId: String!) {
  deleteTemplate(id: $templateId) {
    id
  }
}
    `;
export type DeleteTemplateMutationFn = Apollo.MutationFunction<DeleteTemplateMutation, DeleteTemplateMutationVariables>;

/**
 * __useDeleteTemplateMutation__
 *
 * To run a mutation, you first call `useDeleteTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTemplateMutation, { data, loading, error }] = useDeleteTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useDeleteTemplateMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTemplateMutation, DeleteTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTemplateMutation, DeleteTemplateMutationVariables>(DeleteTemplateDocument, options);
      }
export type DeleteTemplateMutationHookResult = ReturnType<typeof useDeleteTemplateMutation>;
export type DeleteTemplateMutationResult = Apollo.MutationResult<DeleteTemplateMutation>;
export type DeleteTemplateMutationOptions = Apollo.BaseMutationOptions<DeleteTemplateMutation, DeleteTemplateMutationVariables>;
export const CreateShotAttributeTemplateDocument = gql`
    mutation createShotAttributeTemplate($templateId: String!, $attributeType: ShotAttributeType!) {
  createShotAttributeTemplate(
    createDTO: {templateId: $templateId, type: $attributeType}
  ) {
    id
    name
    position
  }
}
    `;
export type CreateShotAttributeTemplateMutationFn = Apollo.MutationFunction<CreateShotAttributeTemplateMutation, CreateShotAttributeTemplateMutationVariables>;

/**
 * __useCreateShotAttributeTemplateMutation__
 *
 * To run a mutation, you first call `useCreateShotAttributeTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateShotAttributeTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createShotAttributeTemplateMutation, { data, loading, error }] = useCreateShotAttributeTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      attributeType: // value for 'attributeType'
 *   },
 * });
 */
export function useCreateShotAttributeTemplateMutation(baseOptions?: Apollo.MutationHookOptions<CreateShotAttributeTemplateMutation, CreateShotAttributeTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateShotAttributeTemplateMutation, CreateShotAttributeTemplateMutationVariables>(CreateShotAttributeTemplateDocument, options);
      }
export type CreateShotAttributeTemplateMutationHookResult = ReturnType<typeof useCreateShotAttributeTemplateMutation>;
export type CreateShotAttributeTemplateMutationResult = Apollo.MutationResult<CreateShotAttributeTemplateMutation>;
export type CreateShotAttributeTemplateMutationOptions = Apollo.BaseMutationOptions<CreateShotAttributeTemplateMutation, CreateShotAttributeTemplateMutationVariables>;
export const UpdateShotAttributeTemplatePositionDocument = gql`
    mutation updateShotAttributeTemplatePosition($id: BigInteger!, $position: Int!) {
  updateShotAttributeTemplate(editDTO: {id: $id, position: $position}) {
    id
    position
  }
}
    `;
export type UpdateShotAttributeTemplatePositionMutationFn = Apollo.MutationFunction<UpdateShotAttributeTemplatePositionMutation, UpdateShotAttributeTemplatePositionMutationVariables>;

/**
 * __useUpdateShotAttributeTemplatePositionMutation__
 *
 * To run a mutation, you first call `useUpdateShotAttributeTemplatePositionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateShotAttributeTemplatePositionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateShotAttributeTemplatePositionMutation, { data, loading, error }] = useUpdateShotAttributeTemplatePositionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      position: // value for 'position'
 *   },
 * });
 */
export function useUpdateShotAttributeTemplatePositionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateShotAttributeTemplatePositionMutation, UpdateShotAttributeTemplatePositionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateShotAttributeTemplatePositionMutation, UpdateShotAttributeTemplatePositionMutationVariables>(UpdateShotAttributeTemplatePositionDocument, options);
      }
export type UpdateShotAttributeTemplatePositionMutationHookResult = ReturnType<typeof useUpdateShotAttributeTemplatePositionMutation>;
export type UpdateShotAttributeTemplatePositionMutationResult = Apollo.MutationResult<UpdateShotAttributeTemplatePositionMutation>;
export type UpdateShotAttributeTemplatePositionMutationOptions = Apollo.BaseMutationOptions<UpdateShotAttributeTemplatePositionMutation, UpdateShotAttributeTemplatePositionMutationVariables>;
export const CreateSceneAttributeTemplateDocument = gql`
    mutation createSceneAttributeTemplate($templateId: String!, $attributeType: SceneAttributeType!) {
  createSceneAttributeTemplate(
    createDTO: {templateId: $templateId, type: $attributeType}
  ) {
    id
    name
    position
  }
}
    `;
export type CreateSceneAttributeTemplateMutationFn = Apollo.MutationFunction<CreateSceneAttributeTemplateMutation, CreateSceneAttributeTemplateMutationVariables>;

/**
 * __useCreateSceneAttributeTemplateMutation__
 *
 * To run a mutation, you first call `useCreateSceneAttributeTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSceneAttributeTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSceneAttributeTemplateMutation, { data, loading, error }] = useCreateSceneAttributeTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      attributeType: // value for 'attributeType'
 *   },
 * });
 */
export function useCreateSceneAttributeTemplateMutation(baseOptions?: Apollo.MutationHookOptions<CreateSceneAttributeTemplateMutation, CreateSceneAttributeTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSceneAttributeTemplateMutation, CreateSceneAttributeTemplateMutationVariables>(CreateSceneAttributeTemplateDocument, options);
      }
export type CreateSceneAttributeTemplateMutationHookResult = ReturnType<typeof useCreateSceneAttributeTemplateMutation>;
export type CreateSceneAttributeTemplateMutationResult = Apollo.MutationResult<CreateSceneAttributeTemplateMutation>;
export type CreateSceneAttributeTemplateMutationOptions = Apollo.BaseMutationOptions<CreateSceneAttributeTemplateMutation, CreateSceneAttributeTemplateMutationVariables>;
export const UpdateSceneAttributeTemplatePositionDocument = gql`
    mutation updateSceneAttributeTemplatePosition($id: BigInteger!, $position: Int!) {
  updateSceneAttributeTemplate(editDTO: {id: $id, position: $position}) {
    id
    position
  }
}
    `;
export type UpdateSceneAttributeTemplatePositionMutationFn = Apollo.MutationFunction<UpdateSceneAttributeTemplatePositionMutation, UpdateSceneAttributeTemplatePositionMutationVariables>;

/**
 * __useUpdateSceneAttributeTemplatePositionMutation__
 *
 * To run a mutation, you first call `useUpdateSceneAttributeTemplatePositionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSceneAttributeTemplatePositionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSceneAttributeTemplatePositionMutation, { data, loading, error }] = useUpdateSceneAttributeTemplatePositionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      position: // value for 'position'
 *   },
 * });
 */
export function useUpdateSceneAttributeTemplatePositionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSceneAttributeTemplatePositionMutation, UpdateSceneAttributeTemplatePositionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSceneAttributeTemplatePositionMutation, UpdateSceneAttributeTemplatePositionMutationVariables>(UpdateSceneAttributeTemplatePositionDocument, options);
      }
export type UpdateSceneAttributeTemplatePositionMutationHookResult = ReturnType<typeof useUpdateSceneAttributeTemplatePositionMutation>;
export type UpdateSceneAttributeTemplatePositionMutationResult = Apollo.MutationResult<UpdateSceneAttributeTemplatePositionMutation>;
export type UpdateSceneAttributeTemplatePositionMutationOptions = Apollo.BaseMutationOptions<UpdateSceneAttributeTemplatePositionMutation, UpdateSceneAttributeTemplatePositionMutationVariables>;
export const CheckCurrentUserTierDocument = gql`
    query checkCurrentUserTier {
  currentUser {
    id
    tier
    hasCancelled
  }
}
    `;

/**
 * __useCheckCurrentUserTierQuery__
 *
 * To run a query within a React component, call `useCheckCurrentUserTierQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckCurrentUserTierQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckCurrentUserTierQuery({
 *   variables: {
 *   },
 * });
 */
export function useCheckCurrentUserTierQuery(baseOptions?: Apollo.QueryHookOptions<CheckCurrentUserTierQuery, CheckCurrentUserTierQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckCurrentUserTierQuery, CheckCurrentUserTierQueryVariables>(CheckCurrentUserTierDocument, options);
      }
export function useCheckCurrentUserTierLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckCurrentUserTierQuery, CheckCurrentUserTierQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckCurrentUserTierQuery, CheckCurrentUserTierQueryVariables>(CheckCurrentUserTierDocument, options);
        }
export function useCheckCurrentUserTierSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CheckCurrentUserTierQuery, CheckCurrentUserTierQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CheckCurrentUserTierQuery, CheckCurrentUserTierQueryVariables>(CheckCurrentUserTierDocument, options);
        }
export type CheckCurrentUserTierQueryHookResult = ReturnType<typeof useCheckCurrentUserTierQuery>;
export type CheckCurrentUserTierLazyQueryHookResult = ReturnType<typeof useCheckCurrentUserTierLazyQuery>;
export type CheckCurrentUserTierSuspenseQueryHookResult = ReturnType<typeof useCheckCurrentUserTierSuspenseQuery>;
export type CheckCurrentUserTierQueryResult = Apollo.QueryResult<CheckCurrentUserTierQuery, CheckCurrentUserTierQueryVariables>;
export const GetShotSelectAttributeOptionsDocument = gql`
    query getShotSelectAttributeOptions($definitionId: BigInteger!) {
  shotSelectAttributeOptions(attributeDefinitionId: $definitionId) {
    id
    name
  }
}
    `;

/**
 * __useGetShotSelectAttributeOptionsQuery__
 *
 * To run a query within a React component, call `useGetShotSelectAttributeOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetShotSelectAttributeOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetShotSelectAttributeOptionsQuery({
 *   variables: {
 *      definitionId: // value for 'definitionId'
 *   },
 * });
 */
export function useGetShotSelectAttributeOptionsQuery(baseOptions: Apollo.QueryHookOptions<GetShotSelectAttributeOptionsQuery, GetShotSelectAttributeOptionsQueryVariables> & ({ variables: GetShotSelectAttributeOptionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetShotSelectAttributeOptionsQuery, GetShotSelectAttributeOptionsQueryVariables>(GetShotSelectAttributeOptionsDocument, options);
      }
export function useGetShotSelectAttributeOptionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetShotSelectAttributeOptionsQuery, GetShotSelectAttributeOptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetShotSelectAttributeOptionsQuery, GetShotSelectAttributeOptionsQueryVariables>(GetShotSelectAttributeOptionsDocument, options);
        }
export function useGetShotSelectAttributeOptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetShotSelectAttributeOptionsQuery, GetShotSelectAttributeOptionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetShotSelectAttributeOptionsQuery, GetShotSelectAttributeOptionsQueryVariables>(GetShotSelectAttributeOptionsDocument, options);
        }
export type GetShotSelectAttributeOptionsQueryHookResult = ReturnType<typeof useGetShotSelectAttributeOptionsQuery>;
export type GetShotSelectAttributeOptionsLazyQueryHookResult = ReturnType<typeof useGetShotSelectAttributeOptionsLazyQuery>;
export type GetShotSelectAttributeOptionsSuspenseQueryHookResult = ReturnType<typeof useGetShotSelectAttributeOptionsSuspenseQuery>;
export type GetShotSelectAttributeOptionsQueryResult = Apollo.QueryResult<GetShotSelectAttributeOptionsQuery, GetShotSelectAttributeOptionsQueryVariables>;
export const ShotlistDocument = gql`
    query shotlist($id: String!) {
  shotlist(id: $id) {
    id
    name
    scenes {
      id
      position
      attributes {
        id
        definition {
          id
          name
          position
        }
        ... on SceneSingleSelectAttributeDTO {
          singleSelectValue {
            id
            name
          }
        }
        ... on SceneMultiSelectAttributeDTO {
          multiSelectValue {
            id
            name
          }
        }
        ... on SceneTextAttributeDTO {
          textValue
        }
      }
    }
    sceneAttributeDefinitions {
      id
      name
      position
    }
    shotAttributeDefinitions {
      id
      name
      position
    }
    owner {
      id
      tier
      shotlistCount
    }
  }
}
    `;

/**
 * __useShotlistQuery__
 *
 * To run a query within a React component, call `useShotlistQuery` and pass it any options that fit your needs.
 * When your component renders, `useShotlistQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useShotlistQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useShotlistQuery(baseOptions: Apollo.QueryHookOptions<ShotlistQuery, ShotlistQueryVariables> & ({ variables: ShotlistQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ShotlistQuery, ShotlistQueryVariables>(ShotlistDocument, options);
      }
export function useShotlistLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ShotlistQuery, ShotlistQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ShotlistQuery, ShotlistQueryVariables>(ShotlistDocument, options);
        }
export function useShotlistSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ShotlistQuery, ShotlistQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ShotlistQuery, ShotlistQueryVariables>(ShotlistDocument, options);
        }
export type ShotlistQueryHookResult = ReturnType<typeof useShotlistQuery>;
export type ShotlistLazyQueryHookResult = ReturnType<typeof useShotlistLazyQuery>;
export type ShotlistSuspenseQueryHookResult = ReturnType<typeof useShotlistSuspenseQuery>;
export type ShotlistQueryResult = Apollo.QueryResult<ShotlistQuery, ShotlistQueryVariables>;
export const CurrentUserDocument = gql`
    query currentUser {
  currentUser {
    id
    name
    email
    createdAt
    tier
    hasCancelled
    shotlists {
      name
    }
  }
}
    `;

/**
 * __useCurrentUserQuery__
 *
 * To run a query within a React component, call `useCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
      }
export function useCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserSuspenseQueryHookResult = ReturnType<typeof useCurrentUserSuspenseQuery>;
export type CurrentUserQueryResult = Apollo.QueryResult<CurrentUserQuery, CurrentUserQueryVariables>;
export const TriggerPasswordResetDocument = gql`
    mutation triggerPasswordReset {
  triggerPasswordReset
}
    `;
export type TriggerPasswordResetMutationFn = Apollo.MutationFunction<TriggerPasswordResetMutation, TriggerPasswordResetMutationVariables>;

/**
 * __useTriggerPasswordResetMutation__
 *
 * To run a mutation, you first call `useTriggerPasswordResetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTriggerPasswordResetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [triggerPasswordResetMutation, { data, loading, error }] = useTriggerPasswordResetMutation({
 *   variables: {
 *   },
 * });
 */
export function useTriggerPasswordResetMutation(baseOptions?: Apollo.MutationHookOptions<TriggerPasswordResetMutation, TriggerPasswordResetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TriggerPasswordResetMutation, TriggerPasswordResetMutationVariables>(TriggerPasswordResetDocument, options);
      }
export type TriggerPasswordResetMutationHookResult = ReturnType<typeof useTriggerPasswordResetMutation>;
export type TriggerPasswordResetMutationResult = Apollo.MutationResult<TriggerPasswordResetMutation>;
export type TriggerPasswordResetMutationOptions = Apollo.BaseMutationOptions<TriggerPasswordResetMutation, TriggerPasswordResetMutationVariables>;
export const DeleteUserDocument = gql`
    mutation deleteUser {
  deleteUser {
    id
  }
}
    `;
export type DeleteUserMutationFn = Apollo.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *   },
 * });
 */
export function useDeleteUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, options);
      }
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
export const CreateShotlistDataDocument = gql`
    query createShotlistData {
  templates {
    id
    name
  }
  currentUser {
    tier
    shotlistCount
  }
}
    `;

/**
 * __useCreateShotlistDataQuery__
 *
 * To run a query within a React component, call `useCreateShotlistDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useCreateShotlistDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCreateShotlistDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useCreateShotlistDataQuery(baseOptions?: Apollo.QueryHookOptions<CreateShotlistDataQuery, CreateShotlistDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CreateShotlistDataQuery, CreateShotlistDataQueryVariables>(CreateShotlistDataDocument, options);
      }
export function useCreateShotlistDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CreateShotlistDataQuery, CreateShotlistDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CreateShotlistDataQuery, CreateShotlistDataQueryVariables>(CreateShotlistDataDocument, options);
        }
export function useCreateShotlistDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CreateShotlistDataQuery, CreateShotlistDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CreateShotlistDataQuery, CreateShotlistDataQueryVariables>(CreateShotlistDataDocument, options);
        }
export type CreateShotlistDataQueryHookResult = ReturnType<typeof useCreateShotlistDataQuery>;
export type CreateShotlistDataLazyQueryHookResult = ReturnType<typeof useCreateShotlistDataLazyQuery>;
export type CreateShotlistDataSuspenseQueryHookResult = ReturnType<typeof useCreateShotlistDataSuspenseQuery>;
export type CreateShotlistDataQueryResult = Apollo.QueryResult<CreateShotlistDataQuery, CreateShotlistDataQueryVariables>;
export const CreateShotlistDocument = gql`
    mutation createShotlist($name: String!, $templateId: String) {
  createShotlist(createDTO: {name: $name, templateId: $templateId}) {
    id
  }
}
    `;
export type CreateShotlistMutationFn = Apollo.MutationFunction<CreateShotlistMutation, CreateShotlistMutationVariables>;

/**
 * __useCreateShotlistMutation__
 *
 * To run a mutation, you first call `useCreateShotlistMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateShotlistMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createShotlistMutation, { data, loading, error }] = useCreateShotlistMutation({
 *   variables: {
 *      name: // value for 'name'
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useCreateShotlistMutation(baseOptions?: Apollo.MutationHookOptions<CreateShotlistMutation, CreateShotlistMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateShotlistMutation, CreateShotlistMutationVariables>(CreateShotlistDocument, options);
      }
export type CreateShotlistMutationHookResult = ReturnType<typeof useCreateShotlistMutation>;
export type CreateShotlistMutationResult = Apollo.MutationResult<CreateShotlistMutation>;
export type CreateShotlistMutationOptions = Apollo.BaseMutationOptions<CreateShotlistMutation, CreateShotlistMutationVariables>;
export const CreateTemplateDocument = gql`
    mutation createTemplate($name: String!) {
  createTemplate(createDTO: {name: $name}) {
    id
  }
}
    `;
export type CreateTemplateMutationFn = Apollo.MutationFunction<CreateTemplateMutation, CreateTemplateMutationVariables>;

/**
 * __useCreateTemplateMutation__
 *
 * To run a mutation, you first call `useCreateTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTemplateMutation, { data, loading, error }] = useCreateTemplateMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateTemplateMutation(baseOptions?: Apollo.MutationHookOptions<CreateTemplateMutation, CreateTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTemplateMutation, CreateTemplateMutationVariables>(CreateTemplateDocument, options);
      }
export type CreateTemplateMutationHookResult = ReturnType<typeof useCreateTemplateMutation>;
export type CreateTemplateMutationResult = Apollo.MutationResult<CreateTemplateMutation>;
export type CreateTemplateMutationOptions = Apollo.BaseMutationOptions<CreateTemplateMutation, CreateTemplateMutationVariables>;
export const CreateShotAttributeDefinitionDocument = gql`
    mutation createShotAttributeDefinition($shotlistId: String!, $attributeType: ShotAttributeType!) {
  createShotAttributeDefinition(
    createDTO: {shotlistId: $shotlistId, type: $attributeType}
  ) {
    id
    name
    position
  }
}
    `;
export type CreateShotAttributeDefinitionMutationFn = Apollo.MutationFunction<CreateShotAttributeDefinitionMutation, CreateShotAttributeDefinitionMutationVariables>;

/**
 * __useCreateShotAttributeDefinitionMutation__
 *
 * To run a mutation, you first call `useCreateShotAttributeDefinitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateShotAttributeDefinitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createShotAttributeDefinitionMutation, { data, loading, error }] = useCreateShotAttributeDefinitionMutation({
 *   variables: {
 *      shotlistId: // value for 'shotlistId'
 *      attributeType: // value for 'attributeType'
 *   },
 * });
 */
export function useCreateShotAttributeDefinitionMutation(baseOptions?: Apollo.MutationHookOptions<CreateShotAttributeDefinitionMutation, CreateShotAttributeDefinitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateShotAttributeDefinitionMutation, CreateShotAttributeDefinitionMutationVariables>(CreateShotAttributeDefinitionDocument, options);
      }
export type CreateShotAttributeDefinitionMutationHookResult = ReturnType<typeof useCreateShotAttributeDefinitionMutation>;
export type CreateShotAttributeDefinitionMutationResult = Apollo.MutationResult<CreateShotAttributeDefinitionMutation>;
export type CreateShotAttributeDefinitionMutationOptions = Apollo.BaseMutationOptions<CreateShotAttributeDefinitionMutation, CreateShotAttributeDefinitionMutationVariables>;
export const UpdateShotDefinitionDocument = gql`
    mutation updateShotDefinition($id: BigInteger!, $position: Int!) {
  updateShotAttributeDefinition(editDTO: {id: $id, position: $position}) {
    id
    position
  }
}
    `;
export type UpdateShotDefinitionMutationFn = Apollo.MutationFunction<UpdateShotDefinitionMutation, UpdateShotDefinitionMutationVariables>;

/**
 * __useUpdateShotDefinitionMutation__
 *
 * To run a mutation, you first call `useUpdateShotDefinitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateShotDefinitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateShotDefinitionMutation, { data, loading, error }] = useUpdateShotDefinitionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      position: // value for 'position'
 *   },
 * });
 */
export function useUpdateShotDefinitionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateShotDefinitionMutation, UpdateShotDefinitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateShotDefinitionMutation, UpdateShotDefinitionMutationVariables>(UpdateShotDefinitionDocument, options);
      }
export type UpdateShotDefinitionMutationHookResult = ReturnType<typeof useUpdateShotDefinitionMutation>;
export type UpdateShotDefinitionMutationResult = Apollo.MutationResult<UpdateShotDefinitionMutation>;
export type UpdateShotDefinitionMutationOptions = Apollo.BaseMutationOptions<UpdateShotDefinitionMutation, UpdateShotDefinitionMutationVariables>;
export const CreateSceneAttributeDefinitionDocument = gql`
    mutation createSceneAttributeDefinition($shotlistId: String!, $attributeType: SceneAttributeType!) {
  createSceneAttributeDefinition(
    createDTO: {shotlistId: $shotlistId, type: $attributeType}
  ) {
    id
    name
    position
  }
}
    `;
export type CreateSceneAttributeDefinitionMutationFn = Apollo.MutationFunction<CreateSceneAttributeDefinitionMutation, CreateSceneAttributeDefinitionMutationVariables>;

/**
 * __useCreateSceneAttributeDefinitionMutation__
 *
 * To run a mutation, you first call `useCreateSceneAttributeDefinitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSceneAttributeDefinitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSceneAttributeDefinitionMutation, { data, loading, error }] = useCreateSceneAttributeDefinitionMutation({
 *   variables: {
 *      shotlistId: // value for 'shotlistId'
 *      attributeType: // value for 'attributeType'
 *   },
 * });
 */
export function useCreateSceneAttributeDefinitionMutation(baseOptions?: Apollo.MutationHookOptions<CreateSceneAttributeDefinitionMutation, CreateSceneAttributeDefinitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSceneAttributeDefinitionMutation, CreateSceneAttributeDefinitionMutationVariables>(CreateSceneAttributeDefinitionDocument, options);
      }
export type CreateSceneAttributeDefinitionMutationHookResult = ReturnType<typeof useCreateSceneAttributeDefinitionMutation>;
export type CreateSceneAttributeDefinitionMutationResult = Apollo.MutationResult<CreateSceneAttributeDefinitionMutation>;
export type CreateSceneAttributeDefinitionMutationOptions = Apollo.BaseMutationOptions<CreateSceneAttributeDefinitionMutation, CreateSceneAttributeDefinitionMutationVariables>;
export const UpdateSceneDefinitionDocument = gql`
    mutation updateSceneDefinition($id: BigInteger!, $position: Int!) {
  updateSceneAttributeDefinition(editDTO: {id: $id, position: $position}) {
    id
    position
  }
}
    `;
export type UpdateSceneDefinitionMutationFn = Apollo.MutationFunction<UpdateSceneDefinitionMutation, UpdateSceneDefinitionMutationVariables>;

/**
 * __useUpdateSceneDefinitionMutation__
 *
 * To run a mutation, you first call `useUpdateSceneDefinitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSceneDefinitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSceneDefinitionMutation, { data, loading, error }] = useUpdateSceneDefinitionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      position: // value for 'position'
 *   },
 * });
 */
export function useUpdateSceneDefinitionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSceneDefinitionMutation, UpdateSceneDefinitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSceneDefinitionMutation, UpdateSceneDefinitionMutationVariables>(UpdateSceneDefinitionDocument, options);
      }
export type UpdateSceneDefinitionMutationHookResult = ReturnType<typeof useUpdateSceneDefinitionMutation>;
export type UpdateSceneDefinitionMutationResult = Apollo.MutationResult<UpdateSceneDefinitionMutation>;
export type UpdateSceneDefinitionMutationOptions = Apollo.BaseMutationOptions<UpdateSceneDefinitionMutation, UpdateSceneDefinitionMutationVariables>;
export const UpdateSceneAttributeDefinitionDocument = gql`
    mutation updateSceneAttributeDefinition($id: BigInteger!, $name: String!) {
  updateSceneAttributeDefinition(editDTO: {id: $id, name: $name}) {
    id
  }
}
    `;
export type UpdateSceneAttributeDefinitionMutationFn = Apollo.MutationFunction<UpdateSceneAttributeDefinitionMutation, UpdateSceneAttributeDefinitionMutationVariables>;

/**
 * __useUpdateSceneAttributeDefinitionMutation__
 *
 * To run a mutation, you first call `useUpdateSceneAttributeDefinitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSceneAttributeDefinitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSceneAttributeDefinitionMutation, { data, loading, error }] = useUpdateSceneAttributeDefinitionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateSceneAttributeDefinitionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSceneAttributeDefinitionMutation, UpdateSceneAttributeDefinitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSceneAttributeDefinitionMutation, UpdateSceneAttributeDefinitionMutationVariables>(UpdateSceneAttributeDefinitionDocument, options);
      }
export type UpdateSceneAttributeDefinitionMutationHookResult = ReturnType<typeof useUpdateSceneAttributeDefinitionMutation>;
export type UpdateSceneAttributeDefinitionMutationResult = Apollo.MutationResult<UpdateSceneAttributeDefinitionMutation>;
export type UpdateSceneAttributeDefinitionMutationOptions = Apollo.BaseMutationOptions<UpdateSceneAttributeDefinitionMutation, UpdateSceneAttributeDefinitionMutationVariables>;
export const DeleteSceneAttributeDefinitionDocument = gql`
    mutation deleteSceneAttributeDefinition($definitionId: BigInteger!) {
  deleteSceneAttributeDefinition(id: $definitionId) {
    id
  }
}
    `;
export type DeleteSceneAttributeDefinitionMutationFn = Apollo.MutationFunction<DeleteSceneAttributeDefinitionMutation, DeleteSceneAttributeDefinitionMutationVariables>;

/**
 * __useDeleteSceneAttributeDefinitionMutation__
 *
 * To run a mutation, you first call `useDeleteSceneAttributeDefinitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSceneAttributeDefinitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSceneAttributeDefinitionMutation, { data, loading, error }] = useDeleteSceneAttributeDefinitionMutation({
 *   variables: {
 *      definitionId: // value for 'definitionId'
 *   },
 * });
 */
export function useDeleteSceneAttributeDefinitionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSceneAttributeDefinitionMutation, DeleteSceneAttributeDefinitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSceneAttributeDefinitionMutation, DeleteSceneAttributeDefinitionMutationVariables>(DeleteSceneAttributeDefinitionDocument, options);
      }
export type DeleteSceneAttributeDefinitionMutationHookResult = ReturnType<typeof useDeleteSceneAttributeDefinitionMutation>;
export type DeleteSceneAttributeDefinitionMutationResult = Apollo.MutationResult<DeleteSceneAttributeDefinitionMutation>;
export type DeleteSceneAttributeDefinitionMutationOptions = Apollo.BaseMutationOptions<DeleteSceneAttributeDefinitionMutation, DeleteSceneAttributeDefinitionMutationVariables>;
export const CreateSceneSelectAttributeOptionDocument = gql`
    mutation createSceneSelectAttributeOption($definitionId: BigInteger!) {
  createSceneSelectAttributeOption(
    createDTO: {attributeDefinitionId: $definitionId}
  ) {
    id
    name
  }
}
    `;
export type CreateSceneSelectAttributeOptionMutationFn = Apollo.MutationFunction<CreateSceneSelectAttributeOptionMutation, CreateSceneSelectAttributeOptionMutationVariables>;

/**
 * __useCreateSceneSelectAttributeOptionMutation__
 *
 * To run a mutation, you first call `useCreateSceneSelectAttributeOptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSceneSelectAttributeOptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSceneSelectAttributeOptionMutation, { data, loading, error }] = useCreateSceneSelectAttributeOptionMutation({
 *   variables: {
 *      definitionId: // value for 'definitionId'
 *   },
 * });
 */
export function useCreateSceneSelectAttributeOptionMutation(baseOptions?: Apollo.MutationHookOptions<CreateSceneSelectAttributeOptionMutation, CreateSceneSelectAttributeOptionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSceneSelectAttributeOptionMutation, CreateSceneSelectAttributeOptionMutationVariables>(CreateSceneSelectAttributeOptionDocument, options);
      }
export type CreateSceneSelectAttributeOptionMutationHookResult = ReturnType<typeof useCreateSceneSelectAttributeOptionMutation>;
export type CreateSceneSelectAttributeOptionMutationResult = Apollo.MutationResult<CreateSceneSelectAttributeOptionMutation>;
export type CreateSceneSelectAttributeOptionMutationOptions = Apollo.BaseMutationOptions<CreateSceneSelectAttributeOptionMutation, CreateSceneSelectAttributeOptionMutationVariables>;
export const DeleteSceneSelectAttributeOptionDocument = gql`
    mutation deleteSceneSelectAttributeOption($optionId: BigInteger!) {
  deleteSceneSelectAttributeOption(id: $optionId) {
    id
  }
}
    `;
export type DeleteSceneSelectAttributeOptionMutationFn = Apollo.MutationFunction<DeleteSceneSelectAttributeOptionMutation, DeleteSceneSelectAttributeOptionMutationVariables>;

/**
 * __useDeleteSceneSelectAttributeOptionMutation__
 *
 * To run a mutation, you first call `useDeleteSceneSelectAttributeOptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSceneSelectAttributeOptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSceneSelectAttributeOptionMutation, { data, loading, error }] = useDeleteSceneSelectAttributeOptionMutation({
 *   variables: {
 *      optionId: // value for 'optionId'
 *   },
 * });
 */
export function useDeleteSceneSelectAttributeOptionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSceneSelectAttributeOptionMutation, DeleteSceneSelectAttributeOptionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSceneSelectAttributeOptionMutation, DeleteSceneSelectAttributeOptionMutationVariables>(DeleteSceneSelectAttributeOptionDocument, options);
      }
export type DeleteSceneSelectAttributeOptionMutationHookResult = ReturnType<typeof useDeleteSceneSelectAttributeOptionMutation>;
export type DeleteSceneSelectAttributeOptionMutationResult = Apollo.MutationResult<DeleteSceneSelectAttributeOptionMutation>;
export type DeleteSceneSelectAttributeOptionMutationOptions = Apollo.BaseMutationOptions<DeleteSceneSelectAttributeOptionMutation, DeleteSceneSelectAttributeOptionMutationVariables>;
export const UpdateSceneSelectAttributeOptionDocument = gql`
    mutation updateSceneSelectAttributeOption($id: BigInteger!, $name: String!) {
  updateSceneSelectAttributeOption(editDTO: {id: $id, name: $name}) {
    id
  }
}
    `;
export type UpdateSceneSelectAttributeOptionMutationFn = Apollo.MutationFunction<UpdateSceneSelectAttributeOptionMutation, UpdateSceneSelectAttributeOptionMutationVariables>;

/**
 * __useUpdateSceneSelectAttributeOptionMutation__
 *
 * To run a mutation, you first call `useUpdateSceneSelectAttributeOptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSceneSelectAttributeOptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSceneSelectAttributeOptionMutation, { data, loading, error }] = useUpdateSceneSelectAttributeOptionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateSceneSelectAttributeOptionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSceneSelectAttributeOptionMutation, UpdateSceneSelectAttributeOptionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSceneSelectAttributeOptionMutation, UpdateSceneSelectAttributeOptionMutationVariables>(UpdateSceneSelectAttributeOptionDocument, options);
      }
export type UpdateSceneSelectAttributeOptionMutationHookResult = ReturnType<typeof useUpdateSceneSelectAttributeOptionMutation>;
export type UpdateSceneSelectAttributeOptionMutationResult = Apollo.MutationResult<UpdateSceneSelectAttributeOptionMutation>;
export type UpdateSceneSelectAttributeOptionMutationOptions = Apollo.BaseMutationOptions<UpdateSceneSelectAttributeOptionMutation, UpdateSceneSelectAttributeOptionMutationVariables>;
export const UpdateShotAttributeDefinitionDocument = gql`
    mutation updateShotAttributeDefinition($id: BigInteger!, $name: String!) {
  updateShotAttributeDefinition(editDTO: {id: $id, name: $name}) {
    id
  }
}
    `;
export type UpdateShotAttributeDefinitionMutationFn = Apollo.MutationFunction<UpdateShotAttributeDefinitionMutation, UpdateShotAttributeDefinitionMutationVariables>;

/**
 * __useUpdateShotAttributeDefinitionMutation__
 *
 * To run a mutation, you first call `useUpdateShotAttributeDefinitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateShotAttributeDefinitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateShotAttributeDefinitionMutation, { data, loading, error }] = useUpdateShotAttributeDefinitionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateShotAttributeDefinitionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateShotAttributeDefinitionMutation, UpdateShotAttributeDefinitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateShotAttributeDefinitionMutation, UpdateShotAttributeDefinitionMutationVariables>(UpdateShotAttributeDefinitionDocument, options);
      }
export type UpdateShotAttributeDefinitionMutationHookResult = ReturnType<typeof useUpdateShotAttributeDefinitionMutation>;
export type UpdateShotAttributeDefinitionMutationResult = Apollo.MutationResult<UpdateShotAttributeDefinitionMutation>;
export type UpdateShotAttributeDefinitionMutationOptions = Apollo.BaseMutationOptions<UpdateShotAttributeDefinitionMutation, UpdateShotAttributeDefinitionMutationVariables>;
export const DeleteShotAttributeDefinitionDocument = gql`
    mutation deleteShotAttributeDefinition($definitionId: BigInteger!) {
  deleteShotAttributeDefinition(id: $definitionId) {
    id
  }
}
    `;
export type DeleteShotAttributeDefinitionMutationFn = Apollo.MutationFunction<DeleteShotAttributeDefinitionMutation, DeleteShotAttributeDefinitionMutationVariables>;

/**
 * __useDeleteShotAttributeDefinitionMutation__
 *
 * To run a mutation, you first call `useDeleteShotAttributeDefinitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteShotAttributeDefinitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteShotAttributeDefinitionMutation, { data, loading, error }] = useDeleteShotAttributeDefinitionMutation({
 *   variables: {
 *      definitionId: // value for 'definitionId'
 *   },
 * });
 */
export function useDeleteShotAttributeDefinitionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteShotAttributeDefinitionMutation, DeleteShotAttributeDefinitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteShotAttributeDefinitionMutation, DeleteShotAttributeDefinitionMutationVariables>(DeleteShotAttributeDefinitionDocument, options);
      }
export type DeleteShotAttributeDefinitionMutationHookResult = ReturnType<typeof useDeleteShotAttributeDefinitionMutation>;
export type DeleteShotAttributeDefinitionMutationResult = Apollo.MutationResult<DeleteShotAttributeDefinitionMutation>;
export type DeleteShotAttributeDefinitionMutationOptions = Apollo.BaseMutationOptions<DeleteShotAttributeDefinitionMutation, DeleteShotAttributeDefinitionMutationVariables>;
export const CreateShotSelectAttributeOptionDocument = gql`
    mutation createShotSelectAttributeOption($definitionId: BigInteger!) {
  createShotSelectAttributeOption(
    createDTO: {attributeDefinitionId: $definitionId}
  ) {
    id
    name
  }
}
    `;
export type CreateShotSelectAttributeOptionMutationFn = Apollo.MutationFunction<CreateShotSelectAttributeOptionMutation, CreateShotSelectAttributeOptionMutationVariables>;

/**
 * __useCreateShotSelectAttributeOptionMutation__
 *
 * To run a mutation, you first call `useCreateShotSelectAttributeOptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateShotSelectAttributeOptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createShotSelectAttributeOptionMutation, { data, loading, error }] = useCreateShotSelectAttributeOptionMutation({
 *   variables: {
 *      definitionId: // value for 'definitionId'
 *   },
 * });
 */
export function useCreateShotSelectAttributeOptionMutation(baseOptions?: Apollo.MutationHookOptions<CreateShotSelectAttributeOptionMutation, CreateShotSelectAttributeOptionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateShotSelectAttributeOptionMutation, CreateShotSelectAttributeOptionMutationVariables>(CreateShotSelectAttributeOptionDocument, options);
      }
export type CreateShotSelectAttributeOptionMutationHookResult = ReturnType<typeof useCreateShotSelectAttributeOptionMutation>;
export type CreateShotSelectAttributeOptionMutationResult = Apollo.MutationResult<CreateShotSelectAttributeOptionMutation>;
export type CreateShotSelectAttributeOptionMutationOptions = Apollo.BaseMutationOptions<CreateShotSelectAttributeOptionMutation, CreateShotSelectAttributeOptionMutationVariables>;
export const DeleteShotSelectAttributeOptionDocument = gql`
    mutation deleteShotSelectAttributeOption($optionId: BigInteger!) {
  deleteShotSelectAttributeOption(id: $optionId) {
    id
  }
}
    `;
export type DeleteShotSelectAttributeOptionMutationFn = Apollo.MutationFunction<DeleteShotSelectAttributeOptionMutation, DeleteShotSelectAttributeOptionMutationVariables>;

/**
 * __useDeleteShotSelectAttributeOptionMutation__
 *
 * To run a mutation, you first call `useDeleteShotSelectAttributeOptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteShotSelectAttributeOptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteShotSelectAttributeOptionMutation, { data, loading, error }] = useDeleteShotSelectAttributeOptionMutation({
 *   variables: {
 *      optionId: // value for 'optionId'
 *   },
 * });
 */
export function useDeleteShotSelectAttributeOptionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteShotSelectAttributeOptionMutation, DeleteShotSelectAttributeOptionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteShotSelectAttributeOptionMutation, DeleteShotSelectAttributeOptionMutationVariables>(DeleteShotSelectAttributeOptionDocument, options);
      }
export type DeleteShotSelectAttributeOptionMutationHookResult = ReturnType<typeof useDeleteShotSelectAttributeOptionMutation>;
export type DeleteShotSelectAttributeOptionMutationResult = Apollo.MutationResult<DeleteShotSelectAttributeOptionMutation>;
export type DeleteShotSelectAttributeOptionMutationOptions = Apollo.BaseMutationOptions<DeleteShotSelectAttributeOptionMutation, DeleteShotSelectAttributeOptionMutationVariables>;
export const UpdateShotSelectAttributeOptionDocument = gql`
    mutation updateShotSelectAttributeOption($id: BigInteger!, $name: String!) {
  updateShotSelectAttributeOption(editDTO: {id: $id, name: $name}) {
    id
  }
}
    `;
export type UpdateShotSelectAttributeOptionMutationFn = Apollo.MutationFunction<UpdateShotSelectAttributeOptionMutation, UpdateShotSelectAttributeOptionMutationVariables>;

/**
 * __useUpdateShotSelectAttributeOptionMutation__
 *
 * To run a mutation, you first call `useUpdateShotSelectAttributeOptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateShotSelectAttributeOptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateShotSelectAttributeOptionMutation, { data, loading, error }] = useUpdateShotSelectAttributeOptionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateShotSelectAttributeOptionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateShotSelectAttributeOptionMutation, UpdateShotSelectAttributeOptionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateShotSelectAttributeOptionMutation, UpdateShotSelectAttributeOptionMutationVariables>(UpdateShotSelectAttributeOptionDocument, options);
      }
export type UpdateShotSelectAttributeOptionMutationHookResult = ReturnType<typeof useUpdateShotSelectAttributeOptionMutation>;
export type UpdateShotSelectAttributeOptionMutationResult = Apollo.MutationResult<UpdateShotSelectAttributeOptionMutation>;
export type UpdateShotSelectAttributeOptionMutationOptions = Apollo.BaseMutationOptions<UpdateShotSelectAttributeOptionMutation, UpdateShotSelectAttributeOptionMutationVariables>;
export const ShotlistForExportDocument = gql`
    query shotlistForExport($id: String!) {
  shotlist(id: $id) {
    id
    name
    scenes {
      id
      position
      attributes {
        id
        definition {
          id
          name
          position
        }
        ... on SceneSingleSelectAttributeDTO {
          singleSelectValue {
            id
            name
          }
        }
        ... on SceneMultiSelectAttributeDTO {
          multiSelectValue {
            id
            name
          }
        }
        ... on SceneTextAttributeDTO {
          textValue
        }
      }
      shots {
        id
        position
        attributes {
          id
          definition {
            id
            name
            position
          }
          ... on ShotSingleSelectAttributeDTO {
            singleSelectValue {
              id
              name
            }
          }
          ... on ShotMultiSelectAttributeDTO {
            multiSelectValue {
              id
              name
            }
          }
          ... on ShotTextAttributeDTO {
            textValue
          }
        }
      }
    }
    sceneAttributeDefinitions {
      id
      name
    }
    shotAttributeDefinitions {
      id
      name
    }
  }
}
    `;

/**
 * __useShotlistForExportQuery__
 *
 * To run a query within a React component, call `useShotlistForExportQuery` and pass it any options that fit your needs.
 * When your component renders, `useShotlistForExportQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useShotlistForExportQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useShotlistForExportQuery(baseOptions: Apollo.QueryHookOptions<ShotlistForExportQuery, ShotlistForExportQueryVariables> & ({ variables: ShotlistForExportQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ShotlistForExportQuery, ShotlistForExportQueryVariables>(ShotlistForExportDocument, options);
      }
export function useShotlistForExportLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ShotlistForExportQuery, ShotlistForExportQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ShotlistForExportQuery, ShotlistForExportQueryVariables>(ShotlistForExportDocument, options);
        }
export function useShotlistForExportSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ShotlistForExportQuery, ShotlistForExportQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ShotlistForExportQuery, ShotlistForExportQueryVariables>(ShotlistForExportDocument, options);
        }
export type ShotlistForExportQueryHookResult = ReturnType<typeof useShotlistForExportQuery>;
export type ShotlistForExportLazyQueryHookResult = ReturnType<typeof useShotlistForExportLazyQuery>;
export type ShotlistForExportSuspenseQueryHookResult = ReturnType<typeof useShotlistForExportSuspenseQuery>;
export type ShotlistForExportQueryResult = Apollo.QueryResult<ShotlistForExportQuery, ShotlistForExportQueryVariables>;
export const UpdateShotlistNameDocument = gql`
    mutation updateShotlistName($shotlistId: String!, $name: String!) {
  updateShotlist(editDTO: {id: $shotlistId, name: $name}) {
    id
    name
  }
}
    `;
export type UpdateShotlistNameMutationFn = Apollo.MutationFunction<UpdateShotlistNameMutation, UpdateShotlistNameMutationVariables>;

/**
 * __useUpdateShotlistNameMutation__
 *
 * To run a mutation, you first call `useUpdateShotlistNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateShotlistNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateShotlistNameMutation, { data, loading, error }] = useUpdateShotlistNameMutation({
 *   variables: {
 *      shotlistId: // value for 'shotlistId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateShotlistNameMutation(baseOptions?: Apollo.MutationHookOptions<UpdateShotlistNameMutation, UpdateShotlistNameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateShotlistNameMutation, UpdateShotlistNameMutationVariables>(UpdateShotlistNameDocument, options);
      }
export type UpdateShotlistNameMutationHookResult = ReturnType<typeof useUpdateShotlistNameMutation>;
export type UpdateShotlistNameMutationResult = Apollo.MutationResult<UpdateShotlistNameMutation>;
export type UpdateShotlistNameMutationOptions = Apollo.BaseMutationOptions<UpdateShotlistNameMutation, UpdateShotlistNameMutationVariables>;
export const DeleteShotlistDocument = gql`
    mutation deleteShotlist($id: String!) {
  deleteShotlist(id: $id) {
    id
  }
}
    `;
export type DeleteShotlistMutationFn = Apollo.MutationFunction<DeleteShotlistMutation, DeleteShotlistMutationVariables>;

/**
 * __useDeleteShotlistMutation__
 *
 * To run a mutation, you first call `useDeleteShotlistMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteShotlistMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteShotlistMutation, { data, loading, error }] = useDeleteShotlistMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteShotlistMutation(baseOptions?: Apollo.MutationHookOptions<DeleteShotlistMutation, DeleteShotlistMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteShotlistMutation, DeleteShotlistMutationVariables>(DeleteShotlistDocument, options);
      }
export type DeleteShotlistMutationHookResult = ReturnType<typeof useDeleteShotlistMutation>;
export type DeleteShotlistMutationResult = Apollo.MutationResult<DeleteShotlistMutation>;
export type DeleteShotlistMutationOptions = Apollo.BaseMutationOptions<DeleteShotlistMutation, DeleteShotlistMutationVariables>;
export const DataDocument = gql`
    query data($shotlistId: String!) {
  shotlist(id: $shotlistId) {
    id
    name
    sceneCount
    shotCount
    editedAt
    createdAt
    owner {
      name
      tier
      shotlistCount
    }
  }
  shotAttributeDefinitions(shotlistId: $shotlistId) {
    id
    name
    position
    ... on ShotSingleSelectAttributeDefinitionDTO {
      options {
        id
        name
      }
    }
    ... on ShotMultiSelectAttributeDefinitionDTO {
      options {
        id
        name
      }
    }
  }
  sceneAttributeDefinitions(shotlistId: $shotlistId) {
    id
    name
    position
    ... on SceneSingleSelectAttributeDefinitionDTO {
      options {
        id
        name
      }
    }
    ... on SceneMultiSelectAttributeDefinitionDTO {
      options {
        id
        name
      }
    }
  }
}
    `;

/**
 * __useDataQuery__
 *
 * To run a query within a React component, call `useDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDataQuery({
 *   variables: {
 *      shotlistId: // value for 'shotlistId'
 *   },
 * });
 */
export function useDataQuery(baseOptions: Apollo.QueryHookOptions<DataQuery, DataQueryVariables> & ({ variables: DataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DataQuery, DataQueryVariables>(DataDocument, options);
      }
export function useDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DataQuery, DataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DataQuery, DataQueryVariables>(DataDocument, options);
        }
export function useDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DataQuery, DataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DataQuery, DataQueryVariables>(DataDocument, options);
        }
export type DataQueryHookResult = ReturnType<typeof useDataQuery>;
export type DataLazyQueryHookResult = ReturnType<typeof useDataLazyQuery>;
export type DataSuspenseQueryHookResult = ReturnType<typeof useDataSuspenseQuery>;
export type DataQueryResult = Apollo.QueryResult<DataQuery, DataQueryVariables>;
export const DeleteShotDocument = gql`
    mutation deleteShot($shotId: String!) {
  deleteShot(id: $shotId) {
    id
  }
}
    `;
export type DeleteShotMutationFn = Apollo.MutationFunction<DeleteShotMutation, DeleteShotMutationVariables>;

/**
 * __useDeleteShotMutation__
 *
 * To run a mutation, you first call `useDeleteShotMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteShotMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteShotMutation, { data, loading, error }] = useDeleteShotMutation({
 *   variables: {
 *      shotId: // value for 'shotId'
 *   },
 * });
 */
export function useDeleteShotMutation(baseOptions?: Apollo.MutationHookOptions<DeleteShotMutation, DeleteShotMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteShotMutation, DeleteShotMutationVariables>(DeleteShotDocument, options);
      }
export type DeleteShotMutationHookResult = ReturnType<typeof useDeleteShotMutation>;
export type DeleteShotMutationResult = Apollo.MutationResult<DeleteShotMutation>;
export type DeleteShotMutationOptions = Apollo.BaseMutationOptions<DeleteShotMutation, DeleteShotMutationVariables>;
export const SearchShotSelectAttributeOptionsDocument = gql`
    query searchShotSelectAttributeOptions($definitionId: BigInteger!, $searchTerm: String!) {
  searchShotSelectAttributeOptions(
    searchDTO: {shotAttributeDefinitionId: $definitionId, searchTerm: $searchTerm}
  ) {
    id
    name
  }
}
    `;

/**
 * __useSearchShotSelectAttributeOptionsQuery__
 *
 * To run a query within a React component, call `useSearchShotSelectAttributeOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchShotSelectAttributeOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchShotSelectAttributeOptionsQuery({
 *   variables: {
 *      definitionId: // value for 'definitionId'
 *      searchTerm: // value for 'searchTerm'
 *   },
 * });
 */
export function useSearchShotSelectAttributeOptionsQuery(baseOptions: Apollo.QueryHookOptions<SearchShotSelectAttributeOptionsQuery, SearchShotSelectAttributeOptionsQueryVariables> & ({ variables: SearchShotSelectAttributeOptionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchShotSelectAttributeOptionsQuery, SearchShotSelectAttributeOptionsQueryVariables>(SearchShotSelectAttributeOptionsDocument, options);
      }
export function useSearchShotSelectAttributeOptionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchShotSelectAttributeOptionsQuery, SearchShotSelectAttributeOptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchShotSelectAttributeOptionsQuery, SearchShotSelectAttributeOptionsQueryVariables>(SearchShotSelectAttributeOptionsDocument, options);
        }
export function useSearchShotSelectAttributeOptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchShotSelectAttributeOptionsQuery, SearchShotSelectAttributeOptionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchShotSelectAttributeOptionsQuery, SearchShotSelectAttributeOptionsQueryVariables>(SearchShotSelectAttributeOptionsDocument, options);
        }
export type SearchShotSelectAttributeOptionsQueryHookResult = ReturnType<typeof useSearchShotSelectAttributeOptionsQuery>;
export type SearchShotSelectAttributeOptionsLazyQueryHookResult = ReturnType<typeof useSearchShotSelectAttributeOptionsLazyQuery>;
export type SearchShotSelectAttributeOptionsSuspenseQueryHookResult = ReturnType<typeof useSearchShotSelectAttributeOptionsSuspenseQuery>;
export type SearchShotSelectAttributeOptionsQueryResult = Apollo.QueryResult<SearchShotSelectAttributeOptionsQuery, SearchShotSelectAttributeOptionsQueryVariables>;
export const CreateShotOptionDocument = gql`
    mutation createShotOption($definitionId: BigInteger!, $name: String!) {
  createShotSelectAttributeOption(
    createDTO: {attributeDefinitionId: $definitionId, name: $name}
  ) {
    id
    name
  }
}
    `;
export type CreateShotOptionMutationFn = Apollo.MutationFunction<CreateShotOptionMutation, CreateShotOptionMutationVariables>;

/**
 * __useCreateShotOptionMutation__
 *
 * To run a mutation, you first call `useCreateShotOptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateShotOptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createShotOptionMutation, { data, loading, error }] = useCreateShotOptionMutation({
 *   variables: {
 *      definitionId: // value for 'definitionId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateShotOptionMutation(baseOptions?: Apollo.MutationHookOptions<CreateShotOptionMutation, CreateShotOptionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateShotOptionMutation, CreateShotOptionMutationVariables>(CreateShotOptionDocument, options);
      }
export type CreateShotOptionMutationHookResult = ReturnType<typeof useCreateShotOptionMutation>;
export type CreateShotOptionMutationResult = Apollo.MutationResult<CreateShotOptionMutation>;
export type CreateShotOptionMutationOptions = Apollo.BaseMutationOptions<CreateShotOptionMutation, CreateShotOptionMutationVariables>;
export const ShotsDocument = gql`
    query shots($sceneId: String!) {
  shots(sceneId: $sceneId) {
    id
    position
    attributes {
      id
      definition {
        id
        name
        position
      }
      ... on ShotSingleSelectAttributeDTO {
        singleSelectValue {
          id
          name
        }
      }
      ... on ShotMultiSelectAttributeDTO {
        multiSelectValue {
          id
          name
        }
      }
      ... on ShotTextAttributeDTO {
        textValue
      }
    }
  }
}
    `;

/**
 * __useShotsQuery__
 *
 * To run a query within a React component, call `useShotsQuery` and pass it any options that fit your needs.
 * When your component renders, `useShotsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useShotsQuery({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useShotsQuery(baseOptions: Apollo.QueryHookOptions<ShotsQuery, ShotsQueryVariables> & ({ variables: ShotsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ShotsQuery, ShotsQueryVariables>(ShotsDocument, options);
      }
export function useShotsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ShotsQuery, ShotsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ShotsQuery, ShotsQueryVariables>(ShotsDocument, options);
        }
export function useShotsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ShotsQuery, ShotsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ShotsQuery, ShotsQueryVariables>(ShotsDocument, options);
        }
export type ShotsQueryHookResult = ReturnType<typeof useShotsQuery>;
export type ShotsLazyQueryHookResult = ReturnType<typeof useShotsLazyQuery>;
export type ShotsSuspenseQueryHookResult = ReturnType<typeof useShotsSuspenseQuery>;
export type ShotsQueryResult = Apollo.QueryResult<ShotsQuery, ShotsQueryVariables>;
export const CreateShotDocument = gql`
    mutation createShot($sceneId: String!) {
  createShot(sceneId: $sceneId) {
    id
    position
    attributes {
      id
      definition {
        id
        name
        position
      }
      ... on ShotSingleSelectAttributeDTO {
        singleSelectValue {
          id
          name
        }
      }
      ... on ShotMultiSelectAttributeDTO {
        multiSelectValue {
          id
          name
        }
      }
      ... on ShotTextAttributeDTO {
        textValue
      }
    }
  }
}
    `;
export type CreateShotMutationFn = Apollo.MutationFunction<CreateShotMutation, CreateShotMutationVariables>;

/**
 * __useCreateShotMutation__
 *
 * To run a mutation, you first call `useCreateShotMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateShotMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createShotMutation, { data, loading, error }] = useCreateShotMutation({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useCreateShotMutation(baseOptions?: Apollo.MutationHookOptions<CreateShotMutation, CreateShotMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateShotMutation, CreateShotMutationVariables>(CreateShotDocument, options);
      }
export type CreateShotMutationHookResult = ReturnType<typeof useCreateShotMutation>;
export type CreateShotMutationResult = Apollo.MutationResult<CreateShotMutation>;
export type CreateShotMutationOptions = Apollo.BaseMutationOptions<CreateShotMutation, CreateShotMutationVariables>;
export const SearchSceneSelectAttributeOptionsDocument = gql`
    query searchSceneSelectAttributeOptions($definitionId: BigInteger!, $searchTerm: String!) {
  searchSceneSelectAttributeOptions(
    searchDTO: {sceneAttributeDefinitionId: $definitionId, searchTerm: $searchTerm}
  ) {
    id
    name
  }
}
    `;

/**
 * __useSearchSceneSelectAttributeOptionsQuery__
 *
 * To run a query within a React component, call `useSearchSceneSelectAttributeOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchSceneSelectAttributeOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchSceneSelectAttributeOptionsQuery({
 *   variables: {
 *      definitionId: // value for 'definitionId'
 *      searchTerm: // value for 'searchTerm'
 *   },
 * });
 */
export function useSearchSceneSelectAttributeOptionsQuery(baseOptions: Apollo.QueryHookOptions<SearchSceneSelectAttributeOptionsQuery, SearchSceneSelectAttributeOptionsQueryVariables> & ({ variables: SearchSceneSelectAttributeOptionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchSceneSelectAttributeOptionsQuery, SearchSceneSelectAttributeOptionsQueryVariables>(SearchSceneSelectAttributeOptionsDocument, options);
      }
export function useSearchSceneSelectAttributeOptionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchSceneSelectAttributeOptionsQuery, SearchSceneSelectAttributeOptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchSceneSelectAttributeOptionsQuery, SearchSceneSelectAttributeOptionsQueryVariables>(SearchSceneSelectAttributeOptionsDocument, options);
        }
export function useSearchSceneSelectAttributeOptionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchSceneSelectAttributeOptionsQuery, SearchSceneSelectAttributeOptionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchSceneSelectAttributeOptionsQuery, SearchSceneSelectAttributeOptionsQueryVariables>(SearchSceneSelectAttributeOptionsDocument, options);
        }
export type SearchSceneSelectAttributeOptionsQueryHookResult = ReturnType<typeof useSearchSceneSelectAttributeOptionsQuery>;
export type SearchSceneSelectAttributeOptionsLazyQueryHookResult = ReturnType<typeof useSearchSceneSelectAttributeOptionsLazyQuery>;
export type SearchSceneSelectAttributeOptionsSuspenseQueryHookResult = ReturnType<typeof useSearchSceneSelectAttributeOptionsSuspenseQuery>;
export type SearchSceneSelectAttributeOptionsQueryResult = Apollo.QueryResult<SearchSceneSelectAttributeOptionsQuery, SearchSceneSelectAttributeOptionsQueryVariables>;
export const CreateSceneOptionDocument = gql`
    mutation createSceneOption($definitionId: BigInteger!, $name: String!) {
  createSceneSelectAttributeOption(
    createDTO: {attributeDefinitionId: $definitionId, name: $name}
  ) {
    id
    name
  }
}
    `;
export type CreateSceneOptionMutationFn = Apollo.MutationFunction<CreateSceneOptionMutation, CreateSceneOptionMutationVariables>;

/**
 * __useCreateSceneOptionMutation__
 *
 * To run a mutation, you first call `useCreateSceneOptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSceneOptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSceneOptionMutation, { data, loading, error }] = useCreateSceneOptionMutation({
 *   variables: {
 *      definitionId: // value for 'definitionId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateSceneOptionMutation(baseOptions?: Apollo.MutationHookOptions<CreateSceneOptionMutation, CreateSceneOptionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSceneOptionMutation, CreateSceneOptionMutationVariables>(CreateSceneOptionDocument, options);
      }
export type CreateSceneOptionMutationHookResult = ReturnType<typeof useCreateSceneOptionMutation>;
export type CreateSceneOptionMutationResult = Apollo.MutationResult<CreateSceneOptionMutation>;
export type CreateSceneOptionMutationOptions = Apollo.BaseMutationOptions<CreateSceneOptionMutation, CreateSceneOptionMutationVariables>;
export const UpdateSceneAttributeDocument = gql`
    mutation updateSceneAttribute($id: BigInteger!, $textValue: String, $singleSelectValue: BigInteger, $multiSelectValue: [BigInteger]) {
  updateSceneAttribute(
    editDTO: {id: $id, textValue: $textValue, singleSelectValue: $singleSelectValue, multiSelectValue: $multiSelectValue}
  ) {
    id
  }
}
    `;
export type UpdateSceneAttributeMutationFn = Apollo.MutationFunction<UpdateSceneAttributeMutation, UpdateSceneAttributeMutationVariables>;

/**
 * __useUpdateSceneAttributeMutation__
 *
 * To run a mutation, you first call `useUpdateSceneAttributeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSceneAttributeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSceneAttributeMutation, { data, loading, error }] = useUpdateSceneAttributeMutation({
 *   variables: {
 *      id: // value for 'id'
 *      textValue: // value for 'textValue'
 *      singleSelectValue: // value for 'singleSelectValue'
 *      multiSelectValue: // value for 'multiSelectValue'
 *   },
 * });
 */
export function useUpdateSceneAttributeMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSceneAttributeMutation, UpdateSceneAttributeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSceneAttributeMutation, UpdateSceneAttributeMutationVariables>(UpdateSceneAttributeDocument, options);
      }
export type UpdateSceneAttributeMutationHookResult = ReturnType<typeof useUpdateSceneAttributeMutation>;
export type UpdateSceneAttributeMutationResult = Apollo.MutationResult<UpdateSceneAttributeMutation>;
export type UpdateSceneAttributeMutationOptions = Apollo.BaseMutationOptions<UpdateSceneAttributeMutation, UpdateSceneAttributeMutationVariables>;
export const UpdateShotlistDocument = gql`
    mutation updateShotlist($shotlistId: String!, $name: String!) {
  updateShotlist(editDTO: {id: $shotlistId, name: $name}) {
    id
    name
  }
}
    `;
export type UpdateShotlistMutationFn = Apollo.MutationFunction<UpdateShotlistMutation, UpdateShotlistMutationVariables>;

/**
 * __useUpdateShotlistMutation__
 *
 * To run a mutation, you first call `useUpdateShotlistMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateShotlistMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateShotlistMutation, { data, loading, error }] = useUpdateShotlistMutation({
 *   variables: {
 *      shotlistId: // value for 'shotlistId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateShotlistMutation(baseOptions?: Apollo.MutationHookOptions<UpdateShotlistMutation, UpdateShotlistMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateShotlistMutation, UpdateShotlistMutationVariables>(UpdateShotlistDocument, options);
      }
export type UpdateShotlistMutationHookResult = ReturnType<typeof useUpdateShotlistMutation>;
export type UpdateShotlistMutationResult = Apollo.MutationResult<UpdateShotlistMutation>;
export type UpdateShotlistMutationOptions = Apollo.BaseMutationOptions<UpdateShotlistMutation, UpdateShotlistMutationVariables>;
export const UpdateSceneDocument = gql`
    mutation updateScene($id: String!, $position: Int!) {
  updateScene(editDTO: {id: $id, position: $position}) {
    id
    position
  }
}
    `;
export type UpdateSceneMutationFn = Apollo.MutationFunction<UpdateSceneMutation, UpdateSceneMutationVariables>;

/**
 * __useUpdateSceneMutation__
 *
 * To run a mutation, you first call `useUpdateSceneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSceneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSceneMutation, { data, loading, error }] = useUpdateSceneMutation({
 *   variables: {
 *      id: // value for 'id'
 *      position: // value for 'position'
 *   },
 * });
 */
export function useUpdateSceneMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSceneMutation, UpdateSceneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSceneMutation, UpdateSceneMutationVariables>(UpdateSceneDocument, options);
      }
export type UpdateSceneMutationHookResult = ReturnType<typeof useUpdateSceneMutation>;
export type UpdateSceneMutationResult = Apollo.MutationResult<UpdateSceneMutation>;
export type UpdateSceneMutationOptions = Apollo.BaseMutationOptions<UpdateSceneMutation, UpdateSceneMutationVariables>;
export const CreateSceneDocument = gql`
    mutation createScene($shotlistId: String!) {
  createScene(shotlistId: $shotlistId) {
    id
    position
    attributes {
      id
      definition {
        id
        name
        position
      }
      ... on SceneSingleSelectAttributeDTO {
        singleSelectValue {
          id
          name
        }
      }
      ... on SceneMultiSelectAttributeDTO {
        multiSelectValue {
          id
          name
        }
      }
      ... on SceneTextAttributeDTO {
        textValue
      }
    }
  }
}
    `;
export type CreateSceneMutationFn = Apollo.MutationFunction<CreateSceneMutation, CreateSceneMutationVariables>;

/**
 * __useCreateSceneMutation__
 *
 * To run a mutation, you first call `useCreateSceneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSceneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSceneMutation, { data, loading, error }] = useCreateSceneMutation({
 *   variables: {
 *      shotlistId: // value for 'shotlistId'
 *   },
 * });
 */
export function useCreateSceneMutation(baseOptions?: Apollo.MutationHookOptions<CreateSceneMutation, CreateSceneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSceneMutation, CreateSceneMutationVariables>(CreateSceneDocument, options);
      }
export type CreateSceneMutationHookResult = ReturnType<typeof useCreateSceneMutation>;
export type CreateSceneMutationResult = Apollo.MutationResult<CreateSceneMutation>;
export type CreateSceneMutationOptions = Apollo.BaseMutationOptions<CreateSceneMutation, CreateSceneMutationVariables>;
export const DeleteSceneDocument = gql`
    mutation deleteScene($sceneId: String!) {
  deleteScene(id: $sceneId) {
    id
  }
}
    `;
export type DeleteSceneMutationFn = Apollo.MutationFunction<DeleteSceneMutation, DeleteSceneMutationVariables>;

/**
 * __useDeleteSceneMutation__
 *
 * To run a mutation, you first call `useDeleteSceneMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSceneMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSceneMutation, { data, loading, error }] = useDeleteSceneMutation({
 *   variables: {
 *      sceneId: // value for 'sceneId'
 *   },
 * });
 */
export function useDeleteSceneMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSceneMutation, DeleteSceneMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSceneMutation, DeleteSceneMutationVariables>(DeleteSceneDocument, options);
      }
export type DeleteSceneMutationHookResult = ReturnType<typeof useDeleteSceneMutation>;
export type DeleteSceneMutationResult = Apollo.MutationResult<DeleteSceneMutation>;
export type DeleteSceneMutationOptions = Apollo.BaseMutationOptions<DeleteSceneMutation, DeleteSceneMutationVariables>;
export const UpdateSceneAttributeTemplateNameDocument = gql`
    mutation updateSceneAttributeTemplateName($id: BigInteger!, $name: String!) {
  updateSceneAttributeTemplate(editDTO: {id: $id, name: $name}) {
    id
  }
}
    `;
export type UpdateSceneAttributeTemplateNameMutationFn = Apollo.MutationFunction<UpdateSceneAttributeTemplateNameMutation, UpdateSceneAttributeTemplateNameMutationVariables>;

/**
 * __useUpdateSceneAttributeTemplateNameMutation__
 *
 * To run a mutation, you first call `useUpdateSceneAttributeTemplateNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSceneAttributeTemplateNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSceneAttributeTemplateNameMutation, { data, loading, error }] = useUpdateSceneAttributeTemplateNameMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateSceneAttributeTemplateNameMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSceneAttributeTemplateNameMutation, UpdateSceneAttributeTemplateNameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSceneAttributeTemplateNameMutation, UpdateSceneAttributeTemplateNameMutationVariables>(UpdateSceneAttributeTemplateNameDocument, options);
      }
export type UpdateSceneAttributeTemplateNameMutationHookResult = ReturnType<typeof useUpdateSceneAttributeTemplateNameMutation>;
export type UpdateSceneAttributeTemplateNameMutationResult = Apollo.MutationResult<UpdateSceneAttributeTemplateNameMutation>;
export type UpdateSceneAttributeTemplateNameMutationOptions = Apollo.BaseMutationOptions<UpdateSceneAttributeTemplateNameMutation, UpdateSceneAttributeTemplateNameMutationVariables>;
export const DeleteSceneAttributeTemplateDocument = gql`
    mutation deleteSceneAttributeTemplate($definitionId: BigInteger!) {
  deleteSceneAttributeTemplate(id: $definitionId) {
    id
  }
}
    `;
export type DeleteSceneAttributeTemplateMutationFn = Apollo.MutationFunction<DeleteSceneAttributeTemplateMutation, DeleteSceneAttributeTemplateMutationVariables>;

/**
 * __useDeleteSceneAttributeTemplateMutation__
 *
 * To run a mutation, you first call `useDeleteSceneAttributeTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSceneAttributeTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSceneAttributeTemplateMutation, { data, loading, error }] = useDeleteSceneAttributeTemplateMutation({
 *   variables: {
 *      definitionId: // value for 'definitionId'
 *   },
 * });
 */
export function useDeleteSceneAttributeTemplateMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSceneAttributeTemplateMutation, DeleteSceneAttributeTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSceneAttributeTemplateMutation, DeleteSceneAttributeTemplateMutationVariables>(DeleteSceneAttributeTemplateDocument, options);
      }
export type DeleteSceneAttributeTemplateMutationHookResult = ReturnType<typeof useDeleteSceneAttributeTemplateMutation>;
export type DeleteSceneAttributeTemplateMutationResult = Apollo.MutationResult<DeleteSceneAttributeTemplateMutation>;
export type DeleteSceneAttributeTemplateMutationOptions = Apollo.BaseMutationOptions<DeleteSceneAttributeTemplateMutation, DeleteSceneAttributeTemplateMutationVariables>;
export const CreateSceneSelectAttributeOptionTemplateDocument = gql`
    mutation createSceneSelectAttributeOptionTemplate($templateId: BigInteger!) {
  createSceneSelectAttributeOptionTemplate(attributeTemplateId: $templateId) {
    id
    name
  }
}
    `;
export type CreateSceneSelectAttributeOptionTemplateMutationFn = Apollo.MutationFunction<CreateSceneSelectAttributeOptionTemplateMutation, CreateSceneSelectAttributeOptionTemplateMutationVariables>;

/**
 * __useCreateSceneSelectAttributeOptionTemplateMutation__
 *
 * To run a mutation, you first call `useCreateSceneSelectAttributeOptionTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSceneSelectAttributeOptionTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSceneSelectAttributeOptionTemplateMutation, { data, loading, error }] = useCreateSceneSelectAttributeOptionTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useCreateSceneSelectAttributeOptionTemplateMutation(baseOptions?: Apollo.MutationHookOptions<CreateSceneSelectAttributeOptionTemplateMutation, CreateSceneSelectAttributeOptionTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSceneSelectAttributeOptionTemplateMutation, CreateSceneSelectAttributeOptionTemplateMutationVariables>(CreateSceneSelectAttributeOptionTemplateDocument, options);
      }
export type CreateSceneSelectAttributeOptionTemplateMutationHookResult = ReturnType<typeof useCreateSceneSelectAttributeOptionTemplateMutation>;
export type CreateSceneSelectAttributeOptionTemplateMutationResult = Apollo.MutationResult<CreateSceneSelectAttributeOptionTemplateMutation>;
export type CreateSceneSelectAttributeOptionTemplateMutationOptions = Apollo.BaseMutationOptions<CreateSceneSelectAttributeOptionTemplateMutation, CreateSceneSelectAttributeOptionTemplateMutationVariables>;
export const DeleteSceneSelectAttributeOptionTemplateDocument = gql`
    mutation deleteSceneSelectAttributeOptionTemplate($optionId: BigInteger!) {
  deleteSceneSelectAttributeOptionTemplate(id: $optionId) {
    id
  }
}
    `;
export type DeleteSceneSelectAttributeOptionTemplateMutationFn = Apollo.MutationFunction<DeleteSceneSelectAttributeOptionTemplateMutation, DeleteSceneSelectAttributeOptionTemplateMutationVariables>;

/**
 * __useDeleteSceneSelectAttributeOptionTemplateMutation__
 *
 * To run a mutation, you first call `useDeleteSceneSelectAttributeOptionTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSceneSelectAttributeOptionTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSceneSelectAttributeOptionTemplateMutation, { data, loading, error }] = useDeleteSceneSelectAttributeOptionTemplateMutation({
 *   variables: {
 *      optionId: // value for 'optionId'
 *   },
 * });
 */
export function useDeleteSceneSelectAttributeOptionTemplateMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSceneSelectAttributeOptionTemplateMutation, DeleteSceneSelectAttributeOptionTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSceneSelectAttributeOptionTemplateMutation, DeleteSceneSelectAttributeOptionTemplateMutationVariables>(DeleteSceneSelectAttributeOptionTemplateDocument, options);
      }
export type DeleteSceneSelectAttributeOptionTemplateMutationHookResult = ReturnType<typeof useDeleteSceneSelectAttributeOptionTemplateMutation>;
export type DeleteSceneSelectAttributeOptionTemplateMutationResult = Apollo.MutationResult<DeleteSceneSelectAttributeOptionTemplateMutation>;
export type DeleteSceneSelectAttributeOptionTemplateMutationOptions = Apollo.BaseMutationOptions<DeleteSceneSelectAttributeOptionTemplateMutation, DeleteSceneSelectAttributeOptionTemplateMutationVariables>;
export const UpdateSceneSelectAttributeOptionTemplateDocument = gql`
    mutation updateSceneSelectAttributeOptionTemplate($id: BigInteger!, $name: String!) {
  updateSceneSelectAttributeOptionTemplate(editDTO: {id: $id, name: $name}) {
    id
  }
}
    `;
export type UpdateSceneSelectAttributeOptionTemplateMutationFn = Apollo.MutationFunction<UpdateSceneSelectAttributeOptionTemplateMutation, UpdateSceneSelectAttributeOptionTemplateMutationVariables>;

/**
 * __useUpdateSceneSelectAttributeOptionTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateSceneSelectAttributeOptionTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSceneSelectAttributeOptionTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSceneSelectAttributeOptionTemplateMutation, { data, loading, error }] = useUpdateSceneSelectAttributeOptionTemplateMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateSceneSelectAttributeOptionTemplateMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSceneSelectAttributeOptionTemplateMutation, UpdateSceneSelectAttributeOptionTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSceneSelectAttributeOptionTemplateMutation, UpdateSceneSelectAttributeOptionTemplateMutationVariables>(UpdateSceneSelectAttributeOptionTemplateDocument, options);
      }
export type UpdateSceneSelectAttributeOptionTemplateMutationHookResult = ReturnType<typeof useUpdateSceneSelectAttributeOptionTemplateMutation>;
export type UpdateSceneSelectAttributeOptionTemplateMutationResult = Apollo.MutationResult<UpdateSceneSelectAttributeOptionTemplateMutation>;
export type UpdateSceneSelectAttributeOptionTemplateMutationOptions = Apollo.BaseMutationOptions<UpdateSceneSelectAttributeOptionTemplateMutation, UpdateSceneSelectAttributeOptionTemplateMutationVariables>;
export const UpdateShotAttributeTemplateNameDocument = gql`
    mutation updateShotAttributeTemplateName($id: BigInteger!, $name: String!) {
  updateShotAttributeTemplate(editDTO: {id: $id, name: $name}) {
    id
  }
}
    `;
export type UpdateShotAttributeTemplateNameMutationFn = Apollo.MutationFunction<UpdateShotAttributeTemplateNameMutation, UpdateShotAttributeTemplateNameMutationVariables>;

/**
 * __useUpdateShotAttributeTemplateNameMutation__
 *
 * To run a mutation, you first call `useUpdateShotAttributeTemplateNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateShotAttributeTemplateNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateShotAttributeTemplateNameMutation, { data, loading, error }] = useUpdateShotAttributeTemplateNameMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateShotAttributeTemplateNameMutation(baseOptions?: Apollo.MutationHookOptions<UpdateShotAttributeTemplateNameMutation, UpdateShotAttributeTemplateNameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateShotAttributeTemplateNameMutation, UpdateShotAttributeTemplateNameMutationVariables>(UpdateShotAttributeTemplateNameDocument, options);
      }
export type UpdateShotAttributeTemplateNameMutationHookResult = ReturnType<typeof useUpdateShotAttributeTemplateNameMutation>;
export type UpdateShotAttributeTemplateNameMutationResult = Apollo.MutationResult<UpdateShotAttributeTemplateNameMutation>;
export type UpdateShotAttributeTemplateNameMutationOptions = Apollo.BaseMutationOptions<UpdateShotAttributeTemplateNameMutation, UpdateShotAttributeTemplateNameMutationVariables>;
export const DeleteShotAttributeTemplateDocument = gql`
    mutation deleteShotAttributeTemplate($definitionId: BigInteger!) {
  deleteShotAttributeTemplate(id: $definitionId) {
    id
  }
}
    `;
export type DeleteShotAttributeTemplateMutationFn = Apollo.MutationFunction<DeleteShotAttributeTemplateMutation, DeleteShotAttributeTemplateMutationVariables>;

/**
 * __useDeleteShotAttributeTemplateMutation__
 *
 * To run a mutation, you first call `useDeleteShotAttributeTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteShotAttributeTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteShotAttributeTemplateMutation, { data, loading, error }] = useDeleteShotAttributeTemplateMutation({
 *   variables: {
 *      definitionId: // value for 'definitionId'
 *   },
 * });
 */
export function useDeleteShotAttributeTemplateMutation(baseOptions?: Apollo.MutationHookOptions<DeleteShotAttributeTemplateMutation, DeleteShotAttributeTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteShotAttributeTemplateMutation, DeleteShotAttributeTemplateMutationVariables>(DeleteShotAttributeTemplateDocument, options);
      }
export type DeleteShotAttributeTemplateMutationHookResult = ReturnType<typeof useDeleteShotAttributeTemplateMutation>;
export type DeleteShotAttributeTemplateMutationResult = Apollo.MutationResult<DeleteShotAttributeTemplateMutation>;
export type DeleteShotAttributeTemplateMutationOptions = Apollo.BaseMutationOptions<DeleteShotAttributeTemplateMutation, DeleteShotAttributeTemplateMutationVariables>;
export const CreateShotSelectAttributeOptionTemplateDocument = gql`
    mutation createShotSelectAttributeOptionTemplate($templateId: BigInteger!) {
  createShotSelectAttributeOptionTemplate(attributeTemplateId: $templateId) {
    id
    name
  }
}
    `;
export type CreateShotSelectAttributeOptionTemplateMutationFn = Apollo.MutationFunction<CreateShotSelectAttributeOptionTemplateMutation, CreateShotSelectAttributeOptionTemplateMutationVariables>;

/**
 * __useCreateShotSelectAttributeOptionTemplateMutation__
 *
 * To run a mutation, you first call `useCreateShotSelectAttributeOptionTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateShotSelectAttributeOptionTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createShotSelectAttributeOptionTemplateMutation, { data, loading, error }] = useCreateShotSelectAttributeOptionTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useCreateShotSelectAttributeOptionTemplateMutation(baseOptions?: Apollo.MutationHookOptions<CreateShotSelectAttributeOptionTemplateMutation, CreateShotSelectAttributeOptionTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateShotSelectAttributeOptionTemplateMutation, CreateShotSelectAttributeOptionTemplateMutationVariables>(CreateShotSelectAttributeOptionTemplateDocument, options);
      }
export type CreateShotSelectAttributeOptionTemplateMutationHookResult = ReturnType<typeof useCreateShotSelectAttributeOptionTemplateMutation>;
export type CreateShotSelectAttributeOptionTemplateMutationResult = Apollo.MutationResult<CreateShotSelectAttributeOptionTemplateMutation>;
export type CreateShotSelectAttributeOptionTemplateMutationOptions = Apollo.BaseMutationOptions<CreateShotSelectAttributeOptionTemplateMutation, CreateShotSelectAttributeOptionTemplateMutationVariables>;
export const DeleteShotSelectAttributeOptionTemplateDocument = gql`
    mutation deleteShotSelectAttributeOptionTemplate($optionId: BigInteger!) {
  deleteShotSelectAttributeOptionTemplate(id: $optionId) {
    id
  }
}
    `;
export type DeleteShotSelectAttributeOptionTemplateMutationFn = Apollo.MutationFunction<DeleteShotSelectAttributeOptionTemplateMutation, DeleteShotSelectAttributeOptionTemplateMutationVariables>;

/**
 * __useDeleteShotSelectAttributeOptionTemplateMutation__
 *
 * To run a mutation, you first call `useDeleteShotSelectAttributeOptionTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteShotSelectAttributeOptionTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteShotSelectAttributeOptionTemplateMutation, { data, loading, error }] = useDeleteShotSelectAttributeOptionTemplateMutation({
 *   variables: {
 *      optionId: // value for 'optionId'
 *   },
 * });
 */
export function useDeleteShotSelectAttributeOptionTemplateMutation(baseOptions?: Apollo.MutationHookOptions<DeleteShotSelectAttributeOptionTemplateMutation, DeleteShotSelectAttributeOptionTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteShotSelectAttributeOptionTemplateMutation, DeleteShotSelectAttributeOptionTemplateMutationVariables>(DeleteShotSelectAttributeOptionTemplateDocument, options);
      }
export type DeleteShotSelectAttributeOptionTemplateMutationHookResult = ReturnType<typeof useDeleteShotSelectAttributeOptionTemplateMutation>;
export type DeleteShotSelectAttributeOptionTemplateMutationResult = Apollo.MutationResult<DeleteShotSelectAttributeOptionTemplateMutation>;
export type DeleteShotSelectAttributeOptionTemplateMutationOptions = Apollo.BaseMutationOptions<DeleteShotSelectAttributeOptionTemplateMutation, DeleteShotSelectAttributeOptionTemplateMutationVariables>;
export const UpdateShotSelectAttributeOptionTemplateDocument = gql`
    mutation updateShotSelectAttributeOptionTemplate($id: BigInteger!, $name: String!) {
  updateShotSelectAttributeOptionTemplate(editDTO: {id: $id, name: $name}) {
    id
  }
}
    `;
export type UpdateShotSelectAttributeOptionTemplateMutationFn = Apollo.MutationFunction<UpdateShotSelectAttributeOptionTemplateMutation, UpdateShotSelectAttributeOptionTemplateMutationVariables>;

/**
 * __useUpdateShotSelectAttributeOptionTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateShotSelectAttributeOptionTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateShotSelectAttributeOptionTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateShotSelectAttributeOptionTemplateMutation, { data, loading, error }] = useUpdateShotSelectAttributeOptionTemplateMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateShotSelectAttributeOptionTemplateMutation(baseOptions?: Apollo.MutationHookOptions<UpdateShotSelectAttributeOptionTemplateMutation, UpdateShotSelectAttributeOptionTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateShotSelectAttributeOptionTemplateMutation, UpdateShotSelectAttributeOptionTemplateMutationVariables>(UpdateShotSelectAttributeOptionTemplateDocument, options);
      }
export type UpdateShotSelectAttributeOptionTemplateMutationHookResult = ReturnType<typeof useUpdateShotSelectAttributeOptionTemplateMutation>;
export type UpdateShotSelectAttributeOptionTemplateMutationResult = Apollo.MutationResult<UpdateShotSelectAttributeOptionTemplateMutation>;
export type UpdateShotSelectAttributeOptionTemplateMutationOptions = Apollo.BaseMutationOptions<UpdateShotSelectAttributeOptionTemplateMutation, UpdateShotSelectAttributeOptionTemplateMutationVariables>;