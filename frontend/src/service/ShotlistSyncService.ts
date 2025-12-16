import {AnySceneAttribute, AnyShotAttribute, SelectOption} from "@/util/Types"
import {SheetManagerRef} from "@/components/shotlist/spreadsheet/sheetManager/sheetManager"
import {ShotAttributeParser} from "@/util/AttributeParser"
import {ShotAttributePayload, ShotlistUpdatePayload} from "@/app/shotlist/[id]/page"
import {
    ShotMultiSelectAttributeDto,
    ShotSelectAttributeOptionDefinition,
    ShotSingleSelectAttributeDto,
    ShotTextAttributeDto
} from "../../lib/graphql/generated"

export type ShotAttributeValueMultiType = string | SelectOption | SelectOption[]

export class ShotlistSyncService {
    shotlistId: string
    isReadOnly: boolean = false

    constructor(shotlistId: string) {
        this.shotlistId = shotlistId
    }

    updateShotAttribute(payload: ShotAttributePayload, sheetManager: SheetManagerRef | null){
        const sheetCellRef = sheetManager?.findCellRef(payload.attribute.id)

        let multiTypeValue: ShotAttributeValueMultiType | null = null
        let textValue: string | null = null

        switch (payload.type) {
            case "ShotTextAttributeDTO":
                const textAttribute = payload.attribute as ShotTextAttributeDto
                multiTypeValue = textAttribute.textValue || "Unknown"
                textValue = textAttribute.textValue || "Unknown"
                break
            case "ShotSingleSelectAttributeDTO":
                const singleAttribute = payload.attribute as ShotSingleSelectAttributeDto
                const option: SelectOption = {
                    label: singleAttribute.singleSelectValue?.name || "",
                    value: singleAttribute.singleSelectValue?.id
                }
                textValue = singleAttribute.singleSelectValue?.name || ""
                multiTypeValue = option
                break
            case "ShotMultiSelectAttributeDTO":
                const multiAttribute = payload.attribute as ShotMultiSelectAttributeDto
                const options: SelectOption[] = multiAttribute.multiSelectValue?.map(
                    (option) => {
                        return {
                            label: option?.name || "",
                            value: option?.id
                        }
                    }
                ) || []
                textValue = <string>options?.map((option) => option?.label).join(", ")
                multiTypeValue = options
                break
        }

        if(this.isReadOnly){
            sheetCellRef?.setReadOnlyValue(textValue || "")
        }
        else if(multiTypeValue){
            sheetCellRef?.setValue(multiTypeValue)
        }
    }
}