import {
    SceneAttributeDefinitionBase, SceneMultiSelectAttributeDefinitionDto,
    SceneMultiSelectAttributeDto, SceneMultiSelectAttributeTemplateDto, SceneSingleSelectAttributeDefinitionDto,
    SceneSingleSelectAttributeDto, SceneSingleSelectAttributeTemplateDto, SceneTextAttributeDefinitionDto,
    SceneTextAttributeDto, SceneTextAttributeTemplateDto,
    ShotAttributeDefinitionBase, ShotlistDto, ShotMultiSelectAttributeDefinitionDto,
    ShotMultiSelectAttributeDto, ShotMultiSelectAttributeTemplateDto, ShotSingleSelectAttributeDefinitionDto,
    ShotSingleSelectAttributeDto, ShotSingleSelectAttributeTemplateDto, ShotTextAttributeDefinitionDto,
    ShotTextAttributeDto, ShotTextAttributeTemplateDto, TemplateDto
} from "../../lib/graphql/generated"

export type AnySceneAttribute = SceneTextAttributeDto | SceneSingleSelectAttributeDto | SceneMultiSelectAttributeDto
export type AnyShotAttribute = ShotTextAttributeDto | ShotSingleSelectAttributeDto | ShotMultiSelectAttributeDto

export type ShotSingleOrMultiSelectAttribute = ShotSingleSelectAttributeDto | ShotMultiSelectAttributeDto
export type SceneSingleOrMultiSelectAttribute = SceneSingleSelectAttributeDto | SceneMultiSelectAttributeDto

export type AnyShotAttributeDefinition = ShotTextAttributeDefinitionDto | ShotSingleSelectAttributeDefinitionDto | ShotMultiSelectAttributeDefinitionDto
export type AnySceneAttributeDefinition = SceneTextAttributeDefinitionDto | SceneMultiSelectAttributeDefinitionDto | SceneSingleSelectAttributeDefinitionDto

export type AnyShotAttributeTemplate = ShotTextAttributeTemplateDto | ShotSingleSelectAttributeTemplateDto | ShotMultiSelectAttributeTemplateDto
export type AnySceneAttributeTemplate = SceneTextAttributeTemplateDto | SceneSingleSelectAttributeTemplateDto | SceneMultiSelectAttributeTemplateDto

export type ShotSingleOrMultiSelectAttributeDefinition = ShotSingleSelectAttributeDefinitionDto | ShotMultiSelectAttributeDefinitionDto
export type SceneSingleOrMultiSelectAttributeDefinition = SceneSingleSelectAttributeDefinitionDto | SceneMultiSelectAttributeDefinitionDto

export type ShotSingleOrMultiSelectAttributeTemplate = ShotSingleSelectAttributeTemplateDto | ShotMultiSelectAttributeTemplateDto
export type SceneSingleOrMultiSelectAttributeTemplate = SceneSingleSelectAttributeTemplateDto | SceneMultiSelectAttributeTemplateDto

export type AnyAttributeDefinition = AnyShotAttributeDefinition | AnySceneAttributeDefinition

export type ShotAttributeValueMultiType = string | SelectOption | SelectOption[] | null

export type SceneAttributeValueMultiType = string | SelectOption | SelectOption[] | null

export type ShotlistOrTemplate = ShotlistDto | TemplateDto

export interface SelectOption {
    label: string
    value: string
}

export interface ShotAttributeValueCollection {
    textValue?: string
    singleSelectValue?: SelectOption | null
    multiSelectValue?: SelectOption[] | null
}

export interface SceneAttributeValueCollection {
    textValue?: string
    singleSelectValue?: number
    multiSelectValue?: number[]
}

export enum ShotlyErrorCode {
    READ_NOT_ALLOWED = "READ_NOT_ALLOWED",
    WRITE_NOT_ALLOWED = "WRITE_NOT_ALLOWED",
    NOT_ALLOWED = "NOT_ALLOWED",

    TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",

    SHOTLIST_LIMIT_REACHED = "SHOTLIST_LIMIT_REACHED",
    COLLABORATOR_LIMIT_REACHED = "COLLABORATOR_LIMIT_REACHED",

    NOT_FOUND = "NOT_FOUND",

    ACCOUNT_DEACTIVATED = "ACCOUNT_DEACTIVATED",
    NO_STRIPE_CUSTOMER_ID = "NO_STRIPE_CUSTOMER_ID",
    ALREADY_SUBSCRIBED = "ALREADY_SUBSCRIBED",
    CHECKOUT_FAILED = "CHECKOUT_FAILED",

    INVALID_INPUT = "INVALID_INPUT",
    IMPOSSIBLE_INPUT = "IMPOSSIBLE_INPUT"
}

export interface GenericError{
    locationKey: string
    message: string
    shotlyErrorCode?: ShotlyErrorCode
    cause?: any
}