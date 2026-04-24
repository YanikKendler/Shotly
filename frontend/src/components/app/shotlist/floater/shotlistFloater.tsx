import {Dispatch, forwardRef, SetStateAction, useImperativeHandle, useRef, useState} from "react"
import {wuAnimate} from "@yanikkendler/web-utils"
import {successNotification} from "@/service/NotificationService"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import DotLoader from "@/components/basic/DotLoader"
import {Check, LoaderCircle, Menu, RefreshCw} from "lucide-react"
import HelpLink from "@/components/app/helpLink/helpLink"
import { SaveState } from "@/app/shotlist/[id]/page"
import "./shotlistFloater.scss"

export interface ShotlistFloaterRef {
    displaySaveState: (state: SaveState) => void
}

export interface ShotlistFloaterProps {
    reloadInProgress: boolean
    refreshShotlist: () => Promise<void>
    setSidebarOpen: Dispatch<SetStateAction<boolean>>
}

const ShotlistFloater = forwardRef<ShotlistFloaterRef, ShotlistFloaterProps>(({
    reloadInProgress,
    refreshShotlist,
    setSidebarOpen
}, ref) => {
    const saveIndicatorRef = useRef<HTMLDivElement>(null)

    const refreshButtonRef = useRef<HTMLButtonElement>(null)
    const [refreshBlocked, setRefreshBlocked] = useState(false)

    useImperativeHandle(ref, () => ({
        displaySaveState: (state: SaveState) => {
            if(saveIndicatorRef.current) {
                saveIndicatorRef.current.setAttribute("data-state", state)
            }
        }
    }))

    const refresh = () => {
        if(refreshBlocked) return

        setRefreshBlocked(true)

        if(refreshButtonRef.current)
            wuAnimate.spin(refreshButtonRef.current, 300, 360)

        refreshShotlist().then(() => {
            successNotification({title: "Shotlist reloaded.", message: "All data is up to date."})
        })

        setTimeout(() => {
            setRefreshBlocked(false)
        }, wuConstants.Time.msPerSecond * 5)
    }

    return (
        <div className="floater">
            {
                reloadInProgress &&
                <SimpleTooltip
                    text={"The reload is automatically triggered when either you or a collaborator make changes to the shotlist options like adding/removing attributes."}
                    fontSize={0.85}
                    offset={0}
                    delay={0}
                >
                    <div className="reloading">
                        Shotlist is reloading<DotLoader/>
                    </div>
                </SimpleTooltip>
            }
            <SimpleTooltip text={refreshBlocked ? "please wait a few seconds" : "refresh"} fontSize={0.8}>
                <button
                    className={"default round right noClickFx"}
                    ref={refreshButtonRef}
                    onClick={refresh}
                    disabled={refreshBlocked}
                >
                    <RefreshCw size={16}/>
                </button>
            </SimpleTooltip>
            <div className="saveIndicator" data-state="saved" ref={saveIndicatorRef} aria-hidden>
                <span className="saving"><LoaderCircle size={18}/></span>
                <span className="saved"><Check size={18} strokeWidth={2.5}/></span>
                <span className="error">!</span>
            </div>
            <HelpLink link="https://docs.shotly.at/shotlist/navigation" name={"Shotlist"}/>
            <button className="openSidebar" onClick={() => setSidebarOpen(true)}><Menu/></button>
        </div>
    )
})

export default ShotlistFloater