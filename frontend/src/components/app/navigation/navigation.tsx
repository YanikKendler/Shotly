import {Archive, House, User} from "lucide-react"
import "./navigation.scss"
import {useAccountDialog} from "@/components/app/dialogs/accountDialog/accountDialog"
import {ReactNode, useContext, useRef} from "react"
import NavigationItem from "@/components/app/navigation/navigationItem"
import CollaborationRequestsPopup
    , {
    CollaborationRequestsPopupRef
} from "@/components/app/dashboard/sidebar/collaborationRequestsPopup/collaborationRequestsPopup"
import Separator from "@/components/basic/separator/separator"
import useNavigationKeybinds from "@/service/useNavigationKeybinds"
import {AppContext} from "@/context/AppContext"
import ViewPortSwitcher from "@/components/utility/viewportSwitcher/viewPortSwitcher"
import {useKeyboardOpen} from "@/utility/useKeyboardOpen"

export default function Navigation({
    onCollaborationAccepted = () => {},
    additionalPages,
    additionalTools
}:{
    onCollaborationAccepted?: () => void,
    additionalPages?: ReactNode
    additionalTools?: ReactNode
}){
    const appContext = useContext(AppContext)
    const accountDialog = useAccountDialog()

    const keyboardOpen = useKeyboardOpen()

    const collabPopupRef = useRef<CollaborationRequestsPopupRef>(null)

    useNavigationKeybinds({
        openAccountDialog: accountDialog.open,
        toggleCollaborationRequests: () => collabPopupRef.current?.toggleCollaborationRequests(),
    })

    const renderTools = () => (<>
        <CollaborationRequestsPopup
            ref={collabPopupRef}
            reloadShotlists={onCollaborationAccepted}
        />
        <NavigationItem
            Icon={User}
            action={accountDialog.open}
            description={<>Your Account <span className="key">Alt</span> <span className="gray">+</span> <span className="key">A</span></>}
            selected={accountDialog.isOpen}
        />
    </>)

    const renderArchive = () => (
        <NavigationItem
            Icon={Archive}
            action={"/dashboard/archive"}
            description={"Archive"}
            selected={appContext.page == "archive"}
        />
    )

    return (
        <nav className={`navigation ${keyboardOpen && "keyboardOpen"}`}>
            <div className="top">
                <NavigationItem
                    Icon={House}
                    action={"/dashboard"}
                    description={<>Dashboard <span className="key">Alt</span> <span className="gray">+</span> <span className="key">H</span></>}
                    selected={appContext.page == "dashboard"}
                />
                {
                    appContext.page == "shotlist"
                        ?
                    <ViewPortSwitcher
                        breakpoint={600}
                        over={renderArchive()}
                    />
                        :
                    renderArchive()
                }
                <ViewPortSwitcher
                    breakpoint={600}
                    under={<>
                        <Separator orientation={"vertical"}/>
                        {renderTools()}
                    </>}
                    over={additionalPages}
                />
            </div>
            <div className="bottom">
                <div id={"additionalTools"}>
                    {additionalTools}
                </div>
                <ViewPortSwitcher breakpoint={600} over={<>
                    {additionalTools && <Separator/>}
                    {renderTools()}
                </>}/>
            </div>
            {accountDialog.Element}
        </nav>
    )
}