import {useEffect} from "react"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys"
import {useRouter} from "next/navigation" //package has incorrectly configured type exports

/* TODO close all functionality does not work */
export default function useNavigationKeybinds({
    openAccountDialog,
    toggleCollaborationRequests,
    closeAll
}:{
    openAccountDialog: () => void
    toggleCollaborationRequests: () => void
    closeAll: () => void
}) {
    const router = useRouter()

    useEffect(() => {
        let unsubscribe = tinykeys(window, {
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