"use client";

import {createContext, RefObject} from "react"
import {
    ShotlistOptionsDialogPages,
} from "@/components/app/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import {GenericError, RowColumn, SelectOption} from "@/utility/Types"
import {PresentCollaborator, SaveState} from "@/app/(application)/shotlist/[id]/page"
import {CollaborationType, UserDto} from "../../lib/graphql/generated"

export interface ShotlistContextProps {
    openShotlistOptionsDialog: (pages?: ShotlistOptionsDialogPages) => void
    shotCount: number
    setShotCount: (count: number) => void
    sceneCount: number
    setSceneCount: (count: number) => void
    focusedCell: RefObject<RowColumn>
    setFocusedCell: (row: number, column: number) => void

    getShotSelectOption: (shotAttributeDefinitionId: number) => SelectOption[]
    loadShotSelectOptions: (shotAttributeDefinitionId: number) => Promise<void>
    addShotSelectOption: (shotAttributeDefinitionId: number, option: SelectOption) => void

    getSceneSelectOption: (sceneAttributeDefinitionId: number) => SelectOption[]
    loadSceneSelectOptions: (sceneAttributeDefinitionId: number) => Promise<void>
    addSceneSelectOption: (sceneAttributeDefinitionId: number, option: SelectOption) => void

    focusedSceneAttributeId: RefObject<number>
    setFocusedSceneAttributeId: (attributeId: number) => void

    setSaveState: (key: string, saveState: SaveState) => void
    handleError: (error: GenericError) => void

    presentCollaborators: Map<string, PresentCollaborator>

    currentCollaborationType: CollaborationType | null
}

export const ShotlistContext = createContext<ShotlistContextProps>({
    //open the edit dialog from anywhere: like the shot attribute value selector
    openShotlistOptionsDialog: (page) => {},
    //for disabling move up/down buttons
    shotCount: 0,
    setShotCount: () => {},
    sceneCount: 0,
    setSceneCount: () => {},
    //for navigation using arrow keys
    focusedCell: { current: { row: -1, column: -1 } },
    setFocusedCell: () => {},
    //to get options for shot single/multi select attributes - handles caching and refetching
    getShotSelectOption: () => [],
    loadShotSelectOptions: () => Promise.resolve(),
    addShotSelectOption: () => {},
    //to get options for scene single/multi select attributes - handles caching and refetching
    getSceneSelectOption: () => [],
    loadSceneSelectOptions: () => Promise.resolve(),
    addSceneSelectOption: () => {},
    //send websocket message to other clients (is not needed for other changes because the server syncs automatically)
    focusedSceneAttributeId: { current: -1 },
    setFocusedSceneAttributeId: () => {},
    //save state display and error handling
    setSaveState: () => {},
    handleError: () => {},
    //for displaying collaborator names from cellHighlight
    presentCollaborators: new Map(),
    //for optionally displaying stuff based on type
    currentCollaborationType: null
})