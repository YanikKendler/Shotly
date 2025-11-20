"use client";

import {createContext} from "react"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/dialog/shotlistOptionsDialog/shotlistOptionsDialoge"
import {ShotAttributeRef} from "@/components/shotAttribute/shotAttribute"

export const ShotlistContext = createContext<{
    openShotlistOptionsDialog: (page: { main: ShotlistOptionsDialogPage, sub?: ShotlistOptionsDialogSubPage }) => void
    elementIsBeingDragged: boolean
    setElementIsBeingDragged: (isBeingDragged: boolean) => void
    shotCount: number
    setShotCount: (count: number) => void
    sceneCount: number
    setSceneCount: (count: number) => void
    focusedShotAttribute: ShotAttributeRef | null
    setFocusedShotAttribute: (attr: ShotAttributeRef) => void
}>({
    openShotlistOptionsDialog: (page) => {}, //open the edit dialog from anywhere: like the shot attribute value selector
    //to disable tooltips when dragging
    elementIsBeingDragged: false,
    setElementIsBeingDragged: (isBeingDragged: boolean) => {},
    //for disabling move up/down buttons
    shotCount: 0,
    setShotCount: (count: number) => {},
    sceneCount: 0,
    setSceneCount: (count: number) => {},
    //for navigation using arrow keys
    focusedShotAttribute: {} as ShotAttributeRef,
    setFocusedShotAttribute: (attr: ShotAttributeRef) => {}
});