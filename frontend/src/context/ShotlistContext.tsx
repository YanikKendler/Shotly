"use client";

import {createContext, Dispatch, RefObject, SetStateAction} from "react"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/app/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import {GenericError, SelectOption} from "@/utility/Types"
import {PresentCollaborator, SaveState, SelectedScene} from "@/app/shotlist/[id]/page"
import {UserMinimalDTO} from "@/service/useShotlistSync"
import SidebarScene from "@/components/app/shotlist/sidebar/sidebarScene/sidebarScene"

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

    broadCastSceneAttributeSelect: (attributeId: number) => void

    setSaveState: (key: string, saveState: SaveState) => void
    handleError: (error: GenericError) => void

    presentCollaborators: Map<string, PresentCollaborator>

    selectedScene: SelectedScene
    selectScene: (scene: SelectedScene) => void
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
    //to get options for scene single/multi select attributes - handles caching and refetching
    getSceneSelectOption: () => [],
    loadSceneSelectOptions: () => Promise.resolve(),
    addSceneSelectOption: () => {},
    //send websocket message to other clients (is not needed for other changes because the server syncs automatically)
    broadCastSceneAttributeSelect: () => {},
    //save state display and error handling
    setSaveState: () => {},
    handleError: () => {},
    //for displaying collaborator names from cellHighlight
    presentCollaborators: new Map(),
    //currently selected scene in sidebar
    selectedScene: { id: null, position: null },
    selectScene: (scene: SelectedScene) => {}
})