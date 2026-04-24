import {ApolloQueryResult} from "@apollo/client"
import {Query} from "../../../../../lib/graphql/generated"
import Skeleton from "react-loading-skeleton"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import "./dashboardHeader.scss"

export default function DashboardHeader({
    query,
    openCreateTemplateDialog,
    openCreateShotlistDialog
}:{
    query: ApolloQueryResult<Query>
    openCreateTemplateDialog: () => void
    openCreateShotlistDialog: () => void
}){
    return (
        <div className="header">
            {
                query.loading ?
                    <>
                        <Skeleton height="2rem" width="12ch"/>
                        <Skeleton height="2rem" width="12ch"/>
                    </>
                    :
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
        </div>
    )
}