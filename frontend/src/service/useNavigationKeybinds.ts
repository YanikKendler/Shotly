import {useContext, useEffect} from "react"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys"
import {useRouter} from "next/navigation"
import {AppContext} from "@/context/AppContext" //package has incorrectly configured type exports

export default function useNavigationKeybinds({
    openAccountDialog,
    toggleCollaborationRequests,
}:{
    openAccountDialog: () => void
    toggleCollaborationRequests: () => void
}) {
    const router = useRouter()
    const appContext = useContext(AppContext)

    useEffect(() => {
        let unsubscribe = tinykeys(window, {
            "Alt+H": event => { //not alt+d because that is reserved by browsers
                event.preventDefault()
                appContext.closeOverlays()
                router.push("/dashboard")
            },
            "Alt+A": event => {
                event.preventDefault()
                appContext.closeOverlays()
                openAccountDialog()
            },
            "Alt+C": event => {
                event.preventDefault()
                appContext.closeOverlays()
                toggleCollaborationRequests()
            }
        })
        return () => {
            unsubscribe()
        }
    }, [])
}