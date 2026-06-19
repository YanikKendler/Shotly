import {useContext, useEffect} from "react"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys"
import {AppContext} from "@/context/AppContext" //package has incorrectly configured type exports

export default function useDashboardKeybinds({
    openCreateShotlistDialog,
    openCreateTemplateDialog,
}:{
    openCreateShotlistDialog: () => void
    openCreateTemplateDialog: () => void
}) {
    const appContext = useContext(AppContext)

    useEffect(() => {
        let unsubscribe = tinykeys(window, {
            "Alt+N": event => {
                appContext.closeOverlays()
                event.preventDefault()
                openCreateShotlistDialog()
            },
            "Alt+S": event => {
                appContext.closeOverlays()
                event.preventDefault()
                openCreateShotlistDialog()
            },
            "Alt+T": event => {
                appContext.closeOverlays()
                event.preventDefault()
                openCreateTemplateDialog()
            },
        })
        return () => {
            unsubscribe()
        }
    }, [])
}