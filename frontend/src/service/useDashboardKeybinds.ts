import {useEffect} from "react"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys" //package has incorrectly configured type exports

export default function useDashboardKeybinds({
    openCreateShotlistDialog,
    openCreateTemplateDialog,
    closeAll
}:{
    openCreateShotlistDialog: () => void
    openCreateTemplateDialog: () => void
    closeAll: () => void
}) {
    useEffect(() => {
        let unsubscribe = tinykeys(window, {
            "Alt+N": event => {
                event.preventDefault()
                closeAll()
                openCreateShotlistDialog()
            },
            "Alt+S": event => {
                event.preventDefault()
                closeAll()
                openCreateShotlistDialog()
            },
            "Alt+T": event => {
                event.preventDefault()
                closeAll()
                openCreateTemplateDialog()
            },
        })
        return () => {
            unsubscribe()
        }
    }, [])
}