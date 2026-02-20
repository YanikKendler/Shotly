"use client";

import {createContext, RefObject} from "react"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import {GenericError, SelectOption} from "@/util/Types"
import {newAnchorRef} from "yaml-ast-parser"
import {SaveState} from "@/app/shotlist/[id]/page"

export interface ShotlistContextProps {
    openShotlistOptionsDialog: (page: { main: ShotlistOptionsDialogPage, sub?: ShotlistOptionsDialogSubPage }) => void
    elementIsBeingDragged: boolean
    setElementIsBeingDragged: (isBeingDragged: boolean) => void
    shotCount: number
    setShotCount: (count: number) => void
    sceneCount: number
    setSceneCount: (count: number) => void
    focusedCell: RefObject<{row: number, column: number}>
    setFocusedCell: (row: number, column: number) => void

    getShotSelectOption: (shotAttributeDefinitionId: number) => SelectOption[]
    loadShotSelectOptions: (shotAttributeDefinitionId: number) => Promise<void>
    addShotSelectOption: (shotAttributeDefinitionId: number, option: SelectOption) => void

    getSceneSelectOption: (sceneAttributeDefinitionId: number) => SelectOption[]
    loadSceneSelectOptions: (sceneAttributeDefinitionId: number) => Promise<void>
    addSceneSelectOption: (sceneAttributeDefinitionId: number, option: SelectOption) => void

    websocketRef: RefObject<WebSocket | null>,
    broadCastSceneAttributeSelect: (attributeId: number) => void
    setSaveState: (key: string, saveState: SaveState) => void
    handleError: (error: GenericError) => void
}

export const ShotlistContext = createContext<ShotlistContextProps>({
    //open the edit dialog from anywhere: like the shot attribute value selector
    openShotlistOptionsDialog: (page) => {},
    //to disable tooltips when dragging
    elementIsBeingDragged: false,
    setElementIsBeingDragged: () => {},
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

    getSceneSelectOption: () => [],
    loadSceneSelectOptions: () => Promise.resolve(),
    addSceneSelectOption: () => {},
    websocketRef: { current: null },
    broadCastSceneAttributeSelect: () => {},
    setSaveState: () => {},
    handleError: () => {}
})