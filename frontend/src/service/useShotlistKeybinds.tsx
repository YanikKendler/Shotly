import {Dispatch, RefObject, SetStateAction, useCallback, useContext, useEffect, useLayoutEffect, useRef} from "react"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys"
import {SheetManagerRef} from "@/components/app/shotlist/table/sheetManager/sheetManager"
import {SceneListRef} from "@/components/app/shotlist/sidebar/sceneList/sceneList"
import {SelectedScene} from "@/app/(application)/shotlist/[id]/page"
import {infoNotification} from "@/service/NotificationService"
import {useRouter} from "next/navigation"
import {RowColumn} from "@/utility/Types"
import {ShotlistContext} from "@/context/ShotlistContext"
import {useLatestCallback} from "@/utility/useLatestCallback"
import {AppContext} from "@/context/AppContext" //package has incorrectly configured type exports

export default function useShotlistKeybinds({
    sheetManagerRef,
    sidebarRef,
    setSelectedScene,
    openShotlistOptionsDialog,
    focusedCell
}:{
    sheetManagerRef: RefObject<SheetManagerRef | null>
    sidebarRef: RefObject<SceneListRef | null>

    openShotlistOptionsDialog: () => void

    setSelectedScene: Dispatch<SetStateAction<SelectedScene>>

    focusedCell: RefObject<RowColumn>
}) {
    const appContext = useContext(AppContext)

    useEffect(() => {
        let unsubscribe = tinykeys(window, {
            "ArrowLeft": event => {
                appContext.closeOverlays()

                sheetManagerRef.current?.moveFocusedCell(event, 0, -1)
            },
            "ArrowRight": event => {
                appContext.closeOverlays()

                sheetManagerRef.current?.moveFocusedCell(event, 0, 1)
            },
            "ArrowUp": event => {
                appContext.closeOverlays()

                sheetManagerRef.current?.moveFocusedCell(event, -1, 0)
            },
            "ArrowDown": event => {
                appContext.closeOverlays()

                sheetManagerRef.current?.moveFocusedCell(event, 1, 0)
            },
            "Control+Enter": event => {
                if(appContext.isKeybindBlocked("Control+Enter")) return

                event.preventDefault()
                sheetManagerRef.current?.handleCreateShotKeybind.current()
            },
            "Alt+Enter": event => {
                if(appContext.isKeybindBlocked("Alt+Enter")) return

                event.preventDefault()
                sheetManagerRef.current?.handleCreateShotKeybind.current()
            },
            "Alt+N": event => {
                if(appContext.isKeybindBlocked("Alt+N")) return

                event.preventDefault()
                sheetManagerRef.current?.handleCreateShotKeybind.current()
            },
            "Alt+([1-9])": event => {
                if(appContext.isKeybindBlocked("")) return

                //TODO always causes scene reload

                event.preventDefault()

                const scenePositionToSelect = Number(event.key) - 1

                const sceneIdToSelect = sidebarRef.current?.getScene(scenePositionToSelect)?.id || null

                setSelectedScene({id: sceneIdToSelect, position: scenePositionToSelect})
            },
            "Alt+O": event => {
                appContext.closeOverlays()

                event.preventDefault()
                openShotlistOptionsDialog()
            },
            "Alt+S": event => {
                if(appContext.isKeybindBlocked("Alt+S")) return

                event.preventDefault()
                sidebarRef.current?.createScene()
            },
            "Alt+.": event => {
                if(appContext.isKeybindBlocked("Alt+.")) return

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