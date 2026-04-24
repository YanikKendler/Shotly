import {Dispatch, RefObject, SetStateAction, useEffect} from "react"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys"
import {SheetManagerRef} from "@/components/app/shotlist/table/sheetManager/sheetManager"
import {ShotlistSidebarRef} from "@/components/app/shotlist/sidebar/shotlistSidebar/shotlistSidebar"
import {SelectedScene} from "@/app/shotlist/[id]/page"
import {DialogRef} from "@/components/basic/dialog/dialog"
import {infoNotification} from "@/service/NotificationService"
import {useRouter} from "next/navigation" //package has incorrectly configured type exports

export default function useShotlistKeybinds({
    sheetManagerRef,
    sidebarRef,
    setSelectedScene,
    shotlistOptionsDialogRef,
    focusedCell
}:{
    sheetManagerRef: RefObject<SheetManagerRef | null>
    sidebarRef: RefObject<ShotlistSidebarRef | null>
    shotlistOptionsDialogRef: RefObject<DialogRef | null>

    setSelectedScene: Dispatch<SetStateAction<SelectedScene>>

    focusedCell: RefObject<{row: number, column: number}>
}) {
    const router = useRouter()

    useEffect(() => {
        let unsubscribe = tinykeys(window, {
            "ArrowLeft": event => {
                sheetManagerRef.current?.moveFocusedCell(event, 0, -1)
            },
            "ArrowRight": event => {
                sheetManagerRef.current?.moveFocusedCell(event, 0, 1)
            },
            "ArrowUp": event => {
                sheetManagerRef.current?.moveFocusedCell(event, -1, 0)
            },
            "ArrowDown": event => {
                sheetManagerRef.current?.moveFocusedCell(event, 1, 0)
            },
            "Control+Enter": event => {
                event.preventDefault()
                sheetManagerRef.current?.handleCreateShotKeybind.current()
            },
            "Alt+Enter": event => {
                event.preventDefault()
                sheetManagerRef.current?.handleCreateShotKeybind.current()
            },
            "Alt+N": event => {
                event.preventDefault()
                sheetManagerRef.current?.handleCreateShotKeybind.current()
            },
            "Alt+([1-9])": event => {
                event.preventDefault()

                const scenePositionToSelect = Number(event.key) - 1

                const sceneIdToSelect = sidebarRef.current?.getScene(scenePositionToSelect)?.id || null

                setSelectedScene({id: sceneIdToSelect, position: scenePositionToSelect})
            },
            "Alt+O": event => {
                event.preventDefault()
                shotlistOptionsDialogRef.current?.open()
            },
            "Alt+A": event => {
                event.preventDefault()
                sidebarRef.current?.openAccountDialog()
            },
            "Alt+H": event => { //not alt+d because that is reserved by browsers
                event.preventDefault()
                router.push("/dashboard")
            },
            "Alt+S": event => {
                event.preventDefault()
                sidebarRef.current?.createScene()
            },
            "Alt+.": event => {
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