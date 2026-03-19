import {
    AnySceneAttribute,
    AnySceneAttributeDefinition, AnySceneAttributeTemplate,
    AnyShotAttribute,
    AnyShotAttributeDefinition, AnyShotAttributeTemplate, SelectOption, ShotAttributeValueMultiType
} from "@/util/Types"
import {ChevronDown, List, Type, Loader} from "lucide-react"
import {JSX} from "react"
import {wuConstants, wuText} from "@yanikkendler/web-utils/dist"
import {
    SceneAttributeDefinitionBase,
    SceneMultiSelectAttributeDto,
    SceneSelectAttributeOptionDefinition, SceneSingleSelectAttributeDto,
    SceneTextAttributeDto, ShotAttributeDefinitionBase, ShotMultiSelectAttributeDto,
    ShotSelectAttributeOptionDefinition, ShotSingleSelectAttributeDto, ShotTextAttributeDto
} from "../../lib/graphql/generated"

export abstract class SceneAttributeParser {
    static toValueString(attribute: AnySceneAttribute, truncate = true): string{
        let result = ""
        switch (attribute.type) {
            case "SceneTextAttributeDTO":
                result = (attribute as SceneTextAttributeDto)?.textValue || ""
                break
            case "SceneSingleSelectAttributeDTO":
                result = <string>(attribute as SceneSingleSelectAttributeDto).singleSelectValue?.name || ""
                break
            case "SceneMultiSelectAttributeDTO":
                result = <string>(attribute as SceneMultiSelectAttributeDto).multiSelectValue?.map((value) => value?.name).join(", ") || ""
                break
        }
        return truncate ? wuText.truncate(result, 15, "..") : result
    }

    static toMultiTypeValue(attribute: AnyShotAttribute): ShotAttributeValueMultiType {
        switch (attribute.type) {
            case "SceneTextAttributeDTO":
                const textAttribute = attribute as SceneTextAttributeDto
                return textAttribute.textValue || null
            case "SceneSingleSelectAttributeDTO":
                const singleAttribute = attribute as SceneSingleSelectAttributeDto
                return  {
                    label: singleAttribute.singleSelectValue?.name || "",
                    value: singleAttribute.singleSelectValue?.id
                }
            case "SceneMultiSelectAttributeDTO":
                const multiAttribute = attribute as SceneMultiSelectAttributeDto
                return multiAttribute.multiSelectValue?.map(
                    (option) => {
                        return {
                            label: option?.name || "",
                            value: option?.id
                        }
                    }
                ) || []
        }
        return null
    }

    static isEmpty(attribute: AnySceneAttribute): boolean{
        if(!attribute) return true

        switch (attribute.type) {
            case "SceneTextAttributeDTO":
                return wuConstants.Regex.empty.test((attribute as SceneTextAttributeDto).textValue || "")
            case "SceneSingleSelectAttributeDTO":
                return (attribute as SceneSingleSelectAttributeDto).singleSelectValue === null
            case "SceneMultiSelectAttributeDTO":
                if(!(attribute as SceneMultiSelectAttributeDto).multiSelectValue) return true
                return (attribute as SceneMultiSelectAttributeDto).multiSelectValue?.length == 0
        }
        return true
    }
}

export abstract class ShotAttributeParser {
    static toValueString(attribute: AnyShotAttribute, truncate = true): string{
        let result = ""
        switch (attribute.type) {
            case "ShotTextAttributeDTO":
                result = (attribute as ShotTextAttributeDto).textValue || ""
                break
            case "ShotSingleSelectAttributeDTO":
                result = <string>(attribute as ShotSingleSelectAttributeDto).singleSelectValue?.name || ""
                break
            case "ShotMultiSelectAttributeDTO":
                result = <string>(attribute as ShotMultiSelectAttributeDto).multiSelectValue?.map((value) => value?.name).join(", ") || ""
                break
        }
        return truncate ? wuText.truncate(result, 15, "..") : result
    }

    static toMultiTypeValue(attribute: AnyShotAttribute): ShotAttributeValueMultiType {
        switch (attribute.type) {
            case "ShotTextAttributeDTO":
                const textAttribute = attribute as ShotTextAttributeDto
                return textAttribute.textValue || null
            case "ShotSingleSelectAttributeDTO":
                const singleAttribute = attribute as ShotSingleSelectAttributeDto
                return  {
                    label: singleAttribute.singleSelectValue?.name || "",
                    value: singleAttribute.singleSelectValue?.id
                }
            case "ShotMultiSelectAttributeDTO":
                const multiAttribute = attribute as ShotMultiSelectAttributeDto
                return multiAttribute.multiSelectValue?.map(
                    (option) => {
                        return {
                            label: option?.name || "",
                            value: option?.id
                        }
                    }
                ) || []
        }
        return null
    }
}

export abstract class ShotAttributeDefinitionParser {
    static toIcon(attribute: AnyShotAttributeDefinition){
        if(!attribute) return Loader
        switch (attribute.type) {
            case "ShotTextAttributeDefinitionDTO":
                return Type
            case "ShotSingleSelectAttributeDefinitionDTO":
                return ChevronDown
            case "ShotMultiSelectAttributeDefinitionDTO":
                return List
            default:
                return Type
        }
    }

    static isMulti(definition: AnyShotAttributeDefinition) {
        return definition.type === "ShotMultiSelectAttributeDefinitionDTO"
    }
}

export abstract class SceneAttributeDefinitionParser {
    static toIcon(attribute: AnySceneAttributeDefinition){
        if(!attribute) return Loader
        switch (attribute.type) {
            case "SceneTextAttributeDefinitionDTO":
                return Type
            case "SceneSingleSelectAttributeDefinitionDTO":
                return ChevronDown
            case "SceneMultiSelectAttributeDefinitionDTO":
                return List
            default:
                return Type
        }
    }

    static isMulti(definition: AnySceneAttributeDefinition) {
        return definition.type === "SceneMultiSelectAttributeDefinitionDTO"
    }
}

export abstract class SceneAttributeTemplateParser {
    static toIcon(attribute: AnySceneAttributeTemplate){
        if(!attribute) return Loader
        switch (attribute.type) {
            case "SceneTextAttributeTemplateDTO":
                return Type
            case "SceneSingleSelectAttributeTemplateDTO":
                return ChevronDown
            case "SceneMultiSelectAttributeTemplateDTO":
                return List
            default:
                return Type
        }
    }
}

export abstract class ShotAttributeTemplateParser {
    static toIcon(attribute: AnyShotAttributeTemplate){
        if(!attribute) return Loader
        switch (attribute.type) {
            case "ShotTextAttributeTemplateDTO":
                return Type
            case "ShotSingleSelectAttributeTemplateDTO":
                return ChevronDown
            case "ShotMultiSelectAttributeTemplateDTO":
                return List
            default:
                return Type
        }
    }
}