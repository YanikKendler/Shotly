import gql from 'graphql-tag';
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
  BigDecimal: { input: any; output: any; }
  BigInteger: { input: any; output: any; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
};

export type Collaboration = {
  __typename?: 'Collaboration';
  collaborationState?: Maybe<CollaborationState>;
  collaborationType?: Maybe<CollaborationType>;
  id?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type CollaborationCreateDtoInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  shotlistId?: InputMaybe<Scalars['String']['input']>;
};

export type CollaborationDto = {
  __typename?: 'CollaborationDTO';
  collaborationState?: Maybe<CollaborationState>;
  collaborationType?: Maybe<CollaborationType>;
  id?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<UserMinimalDto>;
  shotlist?: Maybe<Shotlist>;
  user?: Maybe<UserDto>;
};

export type CollaborationEditDtoInput = {
  collaborationState?: InputMaybe<CollaborationState>;
  collaborationType?: InputMaybe<CollaborationType>;
  id?: InputMaybe<Scalars['String']['input']>;
};

export enum CollaborationState {
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
  Pending = 'PENDING'
}

export enum CollaborationType {
  Edit = 'EDIT',
  View = 'VIEW'
}

/** Mutation root */
export type Mutation = {
  __typename?: 'Mutation';
  acceptOrDeclineCollaboration?: Maybe<CollaborationDto>;
  addCollaboration?: Maybe<Array<Maybe<CollaborationDto>>>;
  adminUpdateUser?: Maybe<UserDto>;
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
  deleteCollaboration?: Maybe<CollaborationDto>;
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
  editCollaboration?: Maybe<CollaborationDto>;
  howDidYourHearReason?: Maybe<User>;
  leaveCollaboration?: Maybe<CollaborationDto>;
  refreshCollaboration?: Maybe<CollaborationDto>;
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
export type MutationAcceptOrDeclineCollaborationArgs = {
  editDTO?: InputMaybe<CollaborationEditDtoInput>;
};


/** Mutation root */
export type MutationAddCollaborationArgs = {
  createDTO?: InputMaybe<CollaborationCreateDtoInput>;
};


/** Mutation root */
export type MutationAdminUpdateUserArgs = {
  updateDTO?: InputMaybe<UserAdminUpdateDtoInput>;
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
export type MutationDeleteCollaborationArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
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
export type MutationEditCollaborationArgs = {
  editDTO?: InputMaybe<CollaborationEditDtoInput>;
};


/** Mutation root */
export type MutationHowDidYourHearReasonArgs = {
  reason?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationLeaveCollaborationArgs = {
  shotlistId?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationRefreshCollaborationArgs = {
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
  allShotlists?: Maybe<Array<Maybe<ShotlistDto>>>;
  allTemplates?: Maybe<Array<Maybe<TemplateDto>>>;
  currentUser?: Maybe<UserDto>;
  pendingCollaborations?: Maybe<Array<Maybe<CollaborationDto>>>;
  recentActiveUserStats?: Maybe<StatCounts>;
  recentCreatedShotlistStats?: Maybe<StatCounts>;
  recentCreatedUserStats?: Maybe<StatCounts>;
  sceneAttributeDefinitions?: Maybe<Array<Maybe<SceneAttributeDefinitionBaseDto>>>;
  sceneSelectAttributeOptions?: Maybe<Array<Maybe<SceneSelectAttributeOptionDefinition>>>;
  scenes?: Maybe<Array<Maybe<SceneDto>>>;
  searchSceneSelectAttributeOptions?: Maybe<Array<Maybe<SceneSelectAttributeOptionDefinition>>>;
  searchShotSelectAttributeOptions?: Maybe<Array<Maybe<ShotSelectAttributeOptionDefinition>>>;
  shotAttributeDefinitions?: Maybe<Array<Maybe<ShotAttributeDefinitionBaseDto>>>;
  shotSelectAttributeOptions?: Maybe<Array<Maybe<ShotSelectAttributeOptionDefinition>>>;
  shotlist?: Maybe<ShotlistDto>;
  shotlists?: Maybe<ShotlistCollection>;
  shots?: Maybe<Array<Maybe<ShotDto>>>;
  template?: Maybe<TemplateDto>;
  templates?: Maybe<Array<Maybe<TemplateDto>>>;
  users?: Maybe<Array<Maybe<UserDto>>>;
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
  type?: Maybe<Scalars['String']['output']>;
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
  type?: Maybe<Scalars['String']['output']>;
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
  type?: Maybe<Scalars['String']['output']>;
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
  shotCount: Scalars['Int']['output'];
  shots?: Maybe<Array<Maybe<ShotDto>>>;
};

export type SceneEditDtoInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  position: Scalars['Int']['input'];
};

export type SceneMultiSelectAttributeDto = SceneAttributeBaseDto & TypeName & {
  __typename?: 'SceneMultiSelectAttributeDTO';
  definition?: Maybe<SceneAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
  multiSelectValue?: Maybe<Array<Maybe<SceneSelectAttributeOptionDefinition>>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type SceneMultiSelectAttributeDefinitionDto = SceneAttributeDefinitionBaseDto & TypeName & {
  __typename?: 'SceneMultiSelectAttributeDefinitionDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<SceneSelectAttributeOptionDefinition>>>;
  position: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type SceneMultiSelectAttributeTemplateDto = SceneAttributeTemplateBaseDto & TypeName & {
  __typename?: 'SceneMultiSelectAttributeTemplateDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<SceneSelectAttributeOptionTemplate>>>;
  position: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
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

export type SceneSingleSelectAttributeDto = SceneAttributeBaseDto & TypeName & {
  __typename?: 'SceneSingleSelectAttributeDTO';
  definition?: Maybe<SceneAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
  singleSelectValue?: Maybe<SceneSelectAttributeOptionDefinition>;
  type?: Maybe<Scalars['String']['output']>;
};

export type SceneSingleSelectAttributeDefinitionDto = SceneAttributeDefinitionBaseDto & TypeName & {
  __typename?: 'SceneSingleSelectAttributeDefinitionDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<SceneSelectAttributeOptionDefinition>>>;
  position: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type SceneSingleSelectAttributeTemplateDto = SceneAttributeTemplateBaseDto & TypeName & {
  __typename?: 'SceneSingleSelectAttributeTemplateDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<SceneSelectAttributeOptionTemplate>>>;
  position: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type SceneTextAttributeDto = SceneAttributeBaseDto & TypeName & {
  __typename?: 'SceneTextAttributeDTO';
  definition?: Maybe<SceneAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
  textValue?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type SceneTextAttributeDefinitionDto = SceneAttributeDefinitionBaseDto & TypeName & {
  __typename?: 'SceneTextAttributeDefinitionDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type SceneTextAttributeTemplateDto = SceneAttributeTemplateBaseDto & TypeName & {
  __typename?: 'SceneTextAttributeTemplateDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
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
  type?: Maybe<Scalars['String']['output']>;
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
  type?: Maybe<Scalars['String']['output']>;
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
  type?: Maybe<Scalars['String']['output']>;
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
  sceneId?: Maybe<Scalars['String']['output']>;
  subshot: Scalars['Boolean']['output'];
};

export type ShotEditDtoInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  position: Scalars['Int']['input'];
};

export type ShotMultiSelectAttributeDto = ShotAttributeBaseDto & TypeName & {
  __typename?: 'ShotMultiSelectAttributeDTO';
  definition?: Maybe<ShotAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
  multiSelectValue?: Maybe<Array<Maybe<ShotSelectAttributeOptionDefinition>>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type ShotMultiSelectAttributeDefinitionDto = ShotAttributeDefinitionBaseDto & TypeName & {
  __typename?: 'ShotMultiSelectAttributeDefinitionDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<ShotSelectAttributeOptionDefinition>>>;
  position: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type ShotMultiSelectAttributeTemplateDto = ShotAttributeTemplateBaseDto & TypeName & {
  __typename?: 'ShotMultiSelectAttributeTemplateDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<ShotSelectAttributeOptionTemplate>>>;
  position: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
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

export type ShotSingleSelectAttributeDto = ShotAttributeBaseDto & TypeName & {
  __typename?: 'ShotSingleSelectAttributeDTO';
  definition?: Maybe<ShotAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
  singleSelectValue?: Maybe<ShotSelectAttributeOptionDefinition>;
  type?: Maybe<Scalars['String']['output']>;
};

export type ShotSingleSelectAttributeDefinitionDto = ShotAttributeDefinitionBaseDto & TypeName & {
  __typename?: 'ShotSingleSelectAttributeDefinitionDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<ShotSelectAttributeOptionDefinition>>>;
  position: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type ShotSingleSelectAttributeTemplateDto = ShotAttributeTemplateBaseDto & TypeName & {
  __typename?: 'ShotSingleSelectAttributeTemplateDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Maybe<ShotSelectAttributeOptionTemplate>>>;
  position: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type ShotTextAttributeDto = ShotAttributeBaseDto & TypeName & {
  __typename?: 'ShotTextAttributeDTO';
  definition?: Maybe<ShotAttributeDefinitionBaseDto>;
  id?: Maybe<Scalars['BigInteger']['output']>;
  textValue?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type ShotTextAttributeDefinitionDto = ShotAttributeDefinitionBaseDto & TypeName & {
  __typename?: 'ShotTextAttributeDefinitionDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type ShotTextAttributeTemplateDto = ShotAttributeTemplateBaseDto & TypeName & {
  __typename?: 'ShotTextAttributeTemplateDTO';
  id?: Maybe<Scalars['BigInteger']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type Shotlist = {
  __typename?: 'Shotlist';
  collaborations?: Maybe<Array<Maybe<Collaboration>>>;
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

export type ShotlistCollection = {
  __typename?: 'ShotlistCollection';
  personal?: Maybe<Array<Maybe<ShotlistDto>>>;
  shared?: Maybe<Array<Maybe<ShotlistDto>>>;
};

export type ShotlistCreateDtoInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  templateId?: InputMaybe<Scalars['String']['input']>;
};

export type ShotlistDto = {
  __typename?: 'ShotlistDTO';
  collaborations?: Maybe<Array<Maybe<CollaborationDto>>>;
  collaboratorCount?: Maybe<Scalars['Int']['output']>;
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** ISO-8601 */
  editedAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<UserDto>;
  sceneAttributeDefinitionCount?: Maybe<Scalars['Int']['output']>;
  sceneAttributeDefinitions?: Maybe<Array<Maybe<SceneAttributeDefinitionBaseDto>>>;
  sceneCount?: Maybe<Scalars['Int']['output']>;
  scenes?: Maybe<Array<Maybe<SceneDto>>>;
  shotAttributeDefinitionCount?: Maybe<Scalars['Int']['output']>;
  shotAttributeDefinitions?: Maybe<Array<Maybe<ShotAttributeDefinitionBaseDto>>>;
  shotCount?: Maybe<Scalars['Int']['output']>;
  template?: Maybe<Template>;
};

export type ShotlistEditDtoInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type StatCounts = {
  __typename?: 'StatCounts';
  eightHours?: Maybe<Scalars['Int']['output']>;
  fourHours?: Maybe<Scalars['Int']['output']>;
  lastHour?: Maybe<Scalars['Int']['output']>;
  sevenDays?: Maybe<Scalars['Int']['output']>;
  thirtyDays?: Maybe<Scalars['Int']['output']>;
  twentyFourHours?: Maybe<Scalars['Int']['output']>;
};

export type Template = {
  __typename?: 'Template';
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  /** ISO-8601 */
  editedAt?: Maybe<Scalars['DateTime']['output']>;
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
  /** ISO-8601 */
  editedAt?: Maybe<Scalars['DateTime']['output']>;
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

export type TypeName = {
  type?: Maybe<Scalars['String']['output']>;
};

export type User = {
  __typename?: 'User';
  auth0Sub?: Maybe<Scalars['String']['output']>;
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  hasCancelled: Scalars['Boolean']['output'];
  howDidYouHearReason?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  /** ISO-8601 */
  lastActiveAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /** ISO-8601 */
  revokeProAfter?: Maybe<Scalars['Date']['output']>;
  shotlists?: Maybe<Array<Maybe<Shotlist>>>;
  stripeCustomerId?: Maybe<Scalars['String']['output']>;
  templates?: Maybe<Array<Maybe<Template>>>;
  tier?: Maybe<UserTier>;
  version?: Maybe<Scalars['BigInteger']['output']>;
};

export type UserAdminUpdateDtoInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** ISO-8601 */
  revokeProAfter?: InputMaybe<Scalars['Date']['input']>;
  tier?: InputMaybe<UserTier>;
};

export type UserDto = {
  __typename?: 'UserDTO';
  active?: Maybe<Scalars['Boolean']['output']>;
  auth0Sub?: Maybe<Scalars['String']['output']>;
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  hasCancelled?: Maybe<Scalars['Boolean']['output']>;
  howDidYouHearReason?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  /** ISO-8601 */
  lastActiveAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  /** ISO-8601 */
  revokeProAfter?: Maybe<Scalars['Date']['output']>;
  shotlistCount?: Maybe<Scalars['Int']['output']>;
  shotlists?: Maybe<Array<Maybe<Shotlist>>>;
  stripeCustomerId?: Maybe<Scalars['String']['output']>;
  templateCount?: Maybe<Scalars['Int']['output']>;
  templates?: Maybe<Array<Maybe<Template>>>;
  tier?: Maybe<UserTier>;
};

export type UserEditDtoInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UserMinimalDto = {
  __typename?: 'UserMinimalDTO';
  auth0Sub?: Maybe<Scalars['String']['output']>;
  /** ISO-8601 */
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  tier?: Maybe<UserTier>;
};

export enum UserTier {
  Basic = 'BASIC',
  Pro = 'PRO',
  ProFree = 'PRO_FREE',
  ProStudent = 'PRO_STUDENT'
}
