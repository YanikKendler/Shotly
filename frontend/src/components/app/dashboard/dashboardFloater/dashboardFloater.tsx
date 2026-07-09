import "./dashboardFloater.scss"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip";
import HelpLink from "@/components/app/helpLink/helpLink";
import {usePathname} from "next/navigation";
import {errorNotification, successNotification} from "@/service/NotificationService";
import {wuAnimate, wuConstants} from "@yanikkendler/web-utils";
import {Dispatch, SetStateAction, useContext, useRef, useState} from "react";
import {RefreshCw} from "lucide-react";
import {ApolloQueryResult} from "@apollo/client"
import {Query} from "../../../../../lib/graphql/generated"
import ViewPortSwitcher from "@/components/utility/viewportSwitcher/viewPortSwitcher"
import Separator from "@/components/basic/separator/separator";
import {AppContext} from "@/context/AppContext"

export default function DashboardFloater({
    reloadDashboardData,
    setRefreshSignal
}:{
    reloadDashboardData: () => Promise<ApolloQueryResult<Query>>
    setRefreshSignal: Dispatch<SetStateAction<number>>
}){
    const pathname = usePathname()
    const appContext = useContext(AppContext)

    const refreshButtonRef = useRef<HTMLButtonElement>(null)
    const [refreshBlocked, setRefreshBlocked] = useState(false)

    const isTemplatePage = pathname.includes("template")

    const refresh = () => {
        if(refreshBlocked) return

        setRefreshBlocked(true)
        setRefreshSignal(current => current + 1)

        appContext.reloadCurrentUser()

        reloadDashboardData()
            .then(() => {
                successNotification({
                    title: "Refreshed dashboard data"
                })
            })
            .catch(() => {
                errorNotification({
                    title: "Failed to refresh dashboard data",
                })
            })

        if(refreshButtonRef.current)
            wuAnimate.spin(refreshButtonRef.current, 300, 360)

        setTimeout(() => {
            setRefreshBlocked(false)
        },wuConstants.Time.msPerSecond * 5)
    }

    return (
        <div className="floater">
            <ViewPortSwitcher
                breakpoint={600}
                over={
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
                }
            />
            <HelpLink
                link={`https://docs.shotly.at/${isTemplatePage ? "templates" : "dashboard"}`}
                name={isTemplatePage ? "Template" : "Dashboard"}
                additionalItems={<ViewPortSwitcher
                    breakpoint={600}
                    under={<>
                        <Separator/>
                        <button onClick={refresh}><RefreshCw size={16}/>Refresh</button>
                    </>}
                />}
            />
        </div>
    )
}