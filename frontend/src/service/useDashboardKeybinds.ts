import {useEffect} from "react"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys"
import {useRouter} from "next/navigation" //package has incorrectly configured type exports

export default function useDashboardKeybinds({
    openCreateShotlistDialog,
    openCreateTemplateDialog,
    openAccountDialog,
    toggleCollaborationRequests
}:{
    openCreateShotlistDialog: () => void
    openCreateTemplateDialog: () => void
    openAccountDialog: () => void
    toggleCollaborationRequests: () => void
}) {
    const router= useRouter()

    useEffect(() => {
        let unsubscribe = tinykeys(window, {
            "Alt+N": event => {
                event.preventDefault()
                openCreateShotlistDialog()
            },
            "Alt+S": event => {
                event.preventDefault()
                openCreateShotlistDialog()
            },
            "Alt+T": event => {
                event.preventDefault()
                openCreateTemplateDialog()
            },
            "Alt+H": event => { //not alt+d because that is reserved by browsers
                event.preventDefault()
                router.push("/dashboard")
            },
            "Alt+A": event => {
                event.preventDefault()
                openAccountDialog()
            },
            "Alt+C": event => {
                event.preventDefault()
                toggleCollaborationRequests()
            }
        })
        return () => {
            unsubscribe()
        }
    }, [])
}