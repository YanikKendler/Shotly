import {Archive, House, User} from "lucide-react"
import "./navigation.scss"
import {useAccountDialog} from "@/components/app/dialogs/accountDialog/accountDialog"
import {ReactNode, useContext, useRef} from "react"
import {ShotlistContext} from "@/context/ShotlistContext"
import NavigationItem from "@/components/app/navigation/navigationItem"
import CollaborationRequestsPopup
    , {
    CollaborationRequestsPopupRef
} from "@/components/app/dashboard/sidebar/collaborationRequestsPopup/collaborationRequestsPopup"
import Separator from "@/components/basic/separator/separator"
import useNavigationKeybinds from "@/service/useNavigationKeybinds"
import {AppContext} from "@/context/AppContext"

//TODO remove shotlistContext
export default function Navigation({
    onCollaborationAccepted = () => {},
    children
}:{
    onCollaborationAccepted?: () => void,
    children?: ReactNode
}){
    const appContext = useContext(AppContext)
    const shotlistContext = useContext(ShotlistContext)
    const accountDialog = useAccountDialog(
        (isOpen)=> {
            if(isOpen)
                shotlistContext.blockKeyBinds.current.set("account", [])
            else
                shotlistContext.blockKeyBinds.current.delete("account")
        }
    )

    const collabPopupRef = useRef<CollaborationRequestsPopupRef>(null)

    useNavigationKeybinds({
        openAccountDialog: accountDialog.open,
        toggleCollaborationRequests: () => collabPopupRef.current?.toggleCollaborationRequests(),
        closeAll: () => {}
    })

    return (
        <nav className={"navigation"}>
            <div className="top">
                <NavigationItem
                    Icon={House}
                    action={"/dashboard"}
                    description={<>Dashboard <span className="key">Alt</span> <span className="gray">+</span> <span className="key">H</span></>}
                    selected={appContext.page == "dashboard"}
                />
                <NavigationItem
                    Icon={Archive}
                    action={"/dashboard/archive"}
                    description={"Archive"}
                    selected={appContext.page == "archive"}
                />
            </div>
            <div className="bottom">
                {children}
                {children && <Separator/>}
                <CollaborationRequestsPopup
                    ref={collabPopupRef}
                    reloadShotlists={onCollaborationAccepted}
                />
                <NavigationItem
                    Icon={User}
                    action={() => {accountDialog.open()}}
                    description={<>Your Account <span className="key">Alt</span> <span className="gray">+</span> <span className="key">A</span></>}
                    selected={accountDialog.isOpen}
                />
            </div>
            {accountDialog.Element}
        </nav>
    )
}