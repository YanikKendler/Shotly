import {Dispatch, RefObject, SetStateAction, useCallback, useContext, useEffect, useLayoutEffect, useRef} from "react"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys"
import {SheetManagerRef} from "@/components/app/shotlist/table/sheetManager/sheetManager"
import {SceneListRef} from "@/components/app/shotlist/sidebar/sceneList/sceneList"
import {SelectedScene} from "@/app/(application)/shotlist/[id]/page"
import {infoNotification} from "@/service/NotificationService"
import {useRouter} from "next/navigation"
import {RowColumn} from "@/utility/Types"
import {ShotlistContext} from "@/context/ShotlistContext"
import {useLatestCallback} from "@/utility/useLatestCallback" //package has incorrectly configured type exports

export default function useShotlistKeybinds({
    sheetManagerRef,
    sidebarRef,
    setSelectedScene,
    openShotlistOptionsDialog,
    focusedCell,
    blockKeyBinds
}:{
    sheetManagerRef: RefObject<SheetManagerRef | null>
    sidebarRef: RefObject<SceneListRef | null>

    openShotlistOptionsDialog: () => void

    setSelectedScene: Dispatch<SetStateAction<SelectedScene>>

    focusedCell: RefObject<RowColumn>

    blockKeyBinds: RefObject<Map<string, string[]>>
}) {
    useEffect(() => {
        const isBlocked = (keybind?: string) => {
            const result = blockKeyBinds.current.size > 0

            if(result && keybind) {
                const currentKeyBindInUse = blockKeyBinds.current.values().some(b => b.includes(keybind))

                if(!currentKeyBindInUse) {
                    infoNotification({
                        title: "This keybind is paused",
                        message: "Close the current dialog/popover to use it [Esc]"
                    })
                }
            }
            return result
        }

        let unsubscribe = tinykeys(window, {
            "ArrowLeft": event => {
                if(isBlocked()) return

                sheetManagerRef.current?.moveFocusedCell(event, 0, -1)
            },
            "ArrowRight": event => {
                if(isBlocked()) return

                sheetManagerRef.current?.moveFocusedCell(event, 0, 1)
            },
            "ArrowUp": event => {
                if(isBlocked()) return

                sheetManagerRef.current?.moveFocusedCell(event, -1, 0)
            },
            "ArrowDown": event => {
                if(isBlocked()) return

                sheetManagerRef.current?.moveFocusedCell(event, 1, 0)
            },
            "Control+Enter": event => {
                if(isBlocked("Control+Enter")) return

                event.preventDefault()
                sheetManagerRef.current?.handleCreateShotKeybind.current()
            },
            "Alt+Enter": event => {
                if(isBlocked("Alt+Enter")) return

                event.preventDefault()
                sheetManagerRef.current?.handleCreateShotKeybind.current()
            },
            "Alt+N": event => {
                if(isBlocked("Alt+N")) return

                event.preventDefault()
                sheetManagerRef.current?.handleCreateShotKeybind.current()
            },
            "Alt+([1-9])": event => {
                if(isBlocked("")) return

                //TODO always causes scene reload

                event.preventDefault()

                const scenePositionToSelect = Number(event.key) - 1

                const sceneIdToSelect = sidebarRef.current?.getScene(scenePositionToSelect)?.id || null

                setSelectedScene({id: sceneIdToSelect, position: scenePositionToSelect})
            },
            "Alt+O": event => {
                if(isBlocked("Alt+0")) return

                event.preventDefault()
                openShotlistOptionsDialog()
            },
            "Alt+S": event => {
                if(isBlocked("Alt+S")) return

                event.preventDefault()
                sidebarRef.current?.createScene()
            },
            "Alt+.": event => {
                if(isBlocked("Alt+.")) return

                event.preventDefault()
                const currentRow = focusedCell.current.row

                if(currentRow < 0) {
                    infoNotification({title: "Select a cell to use this shortcut"})
                    return
                }

                (document.activeElement as HTMLDivElement).blur()

                const rowRef = sheetManagerRef.current?.getRowRef(currentRow)
                rowRef?.openContextOptions()
            }
        })
        return () => {
            unsubscribe()
        }
    }, [])
}