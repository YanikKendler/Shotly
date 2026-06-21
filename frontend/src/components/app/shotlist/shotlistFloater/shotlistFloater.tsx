import {forwardRef, useImperativeHandle, useRef, useState} from "react"
import {wuAnimate} from "@yanikkendler/web-utils"
import {successNotification} from "@/service/NotificationService"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import DotLoader from "@/components/basic/DotLoader"
import {Check, LoaderCircle, Menu, RefreshCw} from "lucide-react"
import HelpLink from "@/components/app/helpLink/helpLink"
import { SaveState } from "@/app/(application)/shotlist/[id]/page"
import "./shotlistFloater.scss"
import ViewPortSwitcher from "@/components/utility/viewportSwitcher/viewPortSwitcher"
import Separator from "@/components/basic/separator/separator"

export interface ShotlistFloaterRef {
    displaySaveState: (state: SaveState) => void
}

export interface ShotlistFloaterProps {
    reloadInProgress: boolean
    refreshShotlist: () => Promise<void>
    restartSync: () => void
}

const ShotlistFloater = forwardRef<ShotlistFloaterRef, ShotlistFloaterProps>(({
    reloadInProgress,
    refreshShotlist,
    restartSync,
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
            successNotification({title: "Shotlist reloaded.", message: "All data is up to date. Sync reconnected."})
        })

        restartSync()

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
            <ViewPortSwitcher
                breakpoint={600}
                over={<>
                    <SimpleTooltip text={refreshBlocked ? "please wait a few seconds" : "refresh"} fontSize={0.8}>
                        <button
                            className={"round right noClickFx"}
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
                </>}
            />
            <HelpLink
                link="https://docs.shotly.at/shotlist/navigation"
                name={"Shotlist"}
                additionalItems={<ViewPortSwitcher
                    breakpoint={600}
                    under={<>
                        <Separator/>
                        <button onClick={refresh}><RefreshCw size={16}/>Refresh</button>
                        <div className="saveIndicator" data-state="saved" ref={saveIndicatorRef} aria-hidden>
                            <span className="saving">Saving changes<DotLoader/></span>
                            <span className="saved">All changes saved</span>
                            <span className="error">Error saving changes</span>
                        </div>
                    </>}
                />}
            />
        </div>
    )
})

export default ShotlistFloater