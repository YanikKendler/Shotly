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

export type ShotlistOrTemplate = ShotlistDto | TemplateDto

export interface SelectOption {
    label: string
    value: string
}

export interface ShotAttributeValueCollection {
    textValue?: string
    singleSelectValue?: number
    multiSelectValue?: number[]
}

export interface SceneAttributeValueCollection {
    textValue?: string
    singleSelectValue?: number
    multiSelectValue?: number[]
}
