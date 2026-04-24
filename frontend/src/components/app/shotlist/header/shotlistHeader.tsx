import {Query, ShotAttributeDefinitionBase} from "../../../../../lib/graphql/generated"
import React, {RefObject} from "react"
import Skeleton from "react-loading-skeleton"
import {ApolloQueryResult} from "@apollo/client"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/app/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import {Settings2} from "lucide-react"
import "./shotlistHeader.scss"

export default function ShotlistHeader({
    query,
    openShotlistOptionsDialog,
    ref
}:{
    query: ApolloQueryResult<Query>
    openShotlistOptionsDialog: (page: { main: ShotlistOptionsDialogPage, sub?: ShotlistOptionsDialogSubPage }) => void
    ref: RefObject<HTMLDivElement | null>
}){

    const renderContent = () => {
        if(query.loading)
            return <>
                <Skeleton width="18vw" height="1rem" style={{marginRight: ".5rem"}}/>
                <Skeleton width="18vw" height="1rem" style={{marginRight: ".5rem"}}/>
                <Skeleton width="18vw" height="1rem" style={{marginRight: ".5rem"}}/>
            </>

        else if(!query.data.shotlist?.shotAttributeDefinitions || query.data.shotlist.shotAttributeDefinitions.length == 0)
            return <p className={"empty"}>No shot attributes defined</p>

        const defs = query.data.shotlist.shotAttributeDefinitions as ShotAttributeDefinitionBase[]
        return defs.map(attr => (
            <div className={`attribute`} key={attr.id}><p>{attr.name || "Unnamed"}</p></div>
        ))
    }

    return (
        <div className="header" ref={ref}>
            <div className="number"><p>#</p></div>
            {renderContent()}
            <button
                className={"add"}
                onClick={() => openShotlistOptionsDialog({
                    main: ShotlistOptionsDialogPage.attributes,
                    sub: ShotlistOptionsDialogSubPage.shot
                })}
            >
                <Settings2 size={16}/>
            </button>
        </div>
    )
}