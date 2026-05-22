import {useEffect} from "react"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys"
import {useRouter} from "next/navigation" //package has incorrectly configured type exports

export default function useDashboardKeybinds({
    openCreateShotlistDialog,
    openCreateTemplateDialog,
    openAccountDialog,
    toggleCollaborationRequests,
    closeAll
}:{
    openCreateShotlistDialog: () => void
    openCreateTemplateDialog: () => void
    openAccountDialog: () => void
    toggleCollaborationRequests: () => void
    closeAll: () => void
}) {
    const router= useRouter()

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
            "Alt+H": event => { //not alt+d because that is reserved by browsers
                event.preventDefault()
                router.push("/dashboard")
            },
            "Alt+A": event => {
                event.preventDefault()
                closeAll()
                openAccountDialog()
            },
            "Alt+C": event => {
                event.preventDefault()
                closeAll()
                toggleCollaborationRequests()
            }
        })
        return () => {
            unsubscribe()
        }
    }, [])
}