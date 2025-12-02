"use client";

import {createContext, RefObject} from "react"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/dialog/shotlistOptionsDialog/shotlistOptionsDialoge"
import {ShotAttributeRef} from "@/components/legacy/shotAttribute/shotAttribute"
import {SelectOption} from "@/util/Types"
import {CellRef} from "@/components/spreadsheet/cell/cell"

export const ShotlistContext = createContext<{
    openShotlistOptionsDialog: (page: { main: ShotlistOptionsDialogPage, sub?: ShotlistOptionsDialogSubPage }) => void
    elementIsBeingDragged: boolean
    setElementIsBeingDragged: (isBeingDragged: boolean) => void
    shotCount: number
    setShotCount: (count: number) => void
    sceneCount: number
    setSceneCount: (count: number) => void
    focusedCell: RefObject<{row: number, column: number}>
    getShotSelectOptions: (shotAttributeDefinitionId: number) => Promise<SelectOption[]>
    searchShotSelectOptions: (shotAttributeDefinitionId: number, search: string) => Promise<SelectOption[]>
    addShotSelectOption: (shotAttributeDefinitionId: number, option: SelectOption) => void
}>({
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
    getShotSelectOptions: () => Promise.resolve([]),
    searchShotSelectOptions: () => Promise.resolve([]),
    addShotSelectOption: () => {},
})