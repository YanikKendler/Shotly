"use client";

import {createContext, RefObject} from "react"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import {SelectOption} from "@/util/Types"
import {newAnchorRef} from "yaml-ast-parser"

export interface ShotlistContextProps {
    openShotlistOptionsDialog: (page: { main: ShotlistOptionsDialogPage, sub?: ShotlistOptionsDialogSubPage }) => void
    elementIsBeingDragged: boolean
    setElementIsBeingDragged: (isBeingDragged: boolean) => void
    shotCount: number
    setShotCount: (count: number) => void
    sceneCount: number
    setSceneCount: (count: number) => void
    focusedCell: RefObject<{row: number, column: number}>
    shotSelectOptions: Map<number, SelectOption[]>
    loadShotSelectOptions: (shotAttributeDefinitionId: number) => Promise<void>
    addShotSelectOption: (shotAttributeDefinitionId: number, option: SelectOption) => void
    sceneSelectOptions: Map<number, SelectOption[]>
    loadSceneSelectOptions: (sceneAttributeDefinitionId: number) => Promise<void>
    addSceneSelectOption: (sceneAttributeDefinitionId: number, option: SelectOption) => void
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
    //to get options for shot single/multi select attributes - handles caching and refetching
    shotSelectOptions: new Map(),
    loadShotSelectOptions: () => Promise.resolve(),
    addShotSelectOption: () => {},
    sceneSelectOptions: new Map(),
    loadSceneSelectOptions: () => Promise.resolve(),
    addSceneSelectOption: () => {},
})