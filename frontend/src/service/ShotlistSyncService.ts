import {AnyShotAttribute, SelectOption} from "@/util/Types"
import {SheetManagerRef} from "@/components/shotlist/spreadsheet/sheetManager/sheetManager"
import {
    ShotDto,
    ShotMultiSelectAttributeDto,
    ShotSingleSelectAttributeDto,
    ShotTextAttributeDto, UserTier
} from "../../lib/graphql/generated"

export type ShotAttributeValueMultiType = string | SelectOption | SelectOption[]

export enum ShotlistUpdateType {
    USER_JOINED = "USER_JOINED",
    USER_LEFT = "USER_LEFT",
    SHOT_ATTRIBUTE_UPDATED = "SHOT_ATTRIBUTE_UPDATED",
    SHOT_UPDATED = "SHOT_UPDATED"
}

/**
 * Object that gets broadcasted to the websocket when a collaborator makes an update to the shotlist
 */
export interface ShotlistUpdateDTO {
    type: ShotlistUpdateType,
    userId: string,
    timestamp: Date,
    payload: ShotlistUpdatePayload
}

/* Payloads */
export interface UserPayload {
    kind: "user"
    user: UserMinimalDTO
}

export interface ShotAttributePayload {
    kind: "shotAttribute"
    attribute: AnyShotAttribute
    type: string
}

export interface ShotPayload {
    kind: "shot"
    shot: ShotDto
}

export type ShotlistUpdatePayload = UserPayload | ShotAttributePayload | ShotPayload

/* other stuff */

export interface UserMinimalDTO {
    id: string,
    email: string,
    auth0Sub: string,
    name: string,
    tier: UserTier,
    createdAt: Date
}

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

    updateShot(payload: ShotPayload, sheetManager: SheetManagerRef | null){
        if(!payload.shot || !payload.shot.id) return

        sheetManager?.onMoveShot(payload.shot.id, payload.shot.position)
    }
}