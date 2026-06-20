import {ApolloQueryResult} from "@apollo/client"
import {Query} from "../../../../../lib/graphql/generated"
import Skeleton from "react-loading-skeleton"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import "./dashboardHeader.scss"
import ViewPortSwitcher from "@/components/utility/viewportSwitcher/viewPortSwitcher"
import {useContext} from "react"
import {AppContext} from "@/context/AppContext"

export default function DashboardHeader({
    query,
    openCreateTemplateDialog,
    openCreateShotlistDialog
}:{
    query: ApolloQueryResult<Query>
    openCreateTemplateDialog: () => void
    openCreateShotlistDialog: () => void
}){
    const appContext = useContext(AppContext)

    return (
        <div className="header">
            {
                query.loading ?
                    <>
                        <Skeleton height="2rem" width="12ch"/>
                        <Skeleton height="2rem" width="12ch"/>
                    </>
                    :
                    <ViewPortSwitcher
                        breakpoint={600}
                        over={
                            <>
                                <SimpleTooltip
                                    content={<p><span className="key">Alt</span> + <span className="key">T</span></p>}
                                >
                                    <button className="template" onClick={openCreateTemplateDialog}>New Template</button>
                                </SimpleTooltip>
                                <SimpleTooltip
                                    content={<p><span className="key">Alt</span> + <span className="key">N</span> or <span className="key">Alt</span> + <span className="key">S</span></p>}
                                >
                                    <button className="shotlist" onClick={openCreateShotlistDialog}>New Shotlist</button>
                                </SimpleTooltip>
                            </>
                        }
                        under={
                            <>
                                <h1>{appContext.page}</h1>
                            </>
                        }
                    />
            }
        </div>
    )
}