import { Panel } from "react-resizable-panels";
import {cloneElement, Dispatch, ReactElement, ReactNode, SetStateAction, useState} from "react"
import Navigation from "@/components/app/navigation/navigation"
import Skeleton from "react-loading-skeleton"
import "./sidebar.scss"

export default function Sidebar({
    className,
    additionalPageItems,
    additionalToolItems,
    heading,
    list,
    bottom,
    isLoading,
    onCollaborationAccepted,
    contentVisible = false,
    setContentVisible = () => {},
    canShowCloseArea = false
}:{
    className: string
    additionalPageItems?: ReactNode
    additionalToolItems?: ReactNode
    heading: string | ReactElement
    list: ReactElement
    bottom?: ReactElement
    isLoading: boolean
    onCollaborationAccepted?: () => void
    contentVisible?: boolean
    setContentVisible?: Dispatch<SetStateAction<boolean>>
    canShowCloseArea?: boolean
}){
    const renderHeading = () => {
        if(isLoading) return <Skeleton height={"2rem"}/>

        if(typeof heading == "string") return <h1>{heading}</h1>
        else return heading
    }

    return (
        <Panel
            defaultSize={20}
            maxSize={40}
            minSize={12}
            className={`sidebar ${contentVisible ? "open" : "closed"} ${className}`}
        >
            <Navigation
                onCollaborationAccepted={onCollaborationAccepted}
                additionalPages={additionalPageItems}
                additionalTools={additionalToolItems}
            />
            <div className={`content ${contentVisible ? "open" : "closed"}`}>
                <div className={`top`}>
                    <div className="heading">
                        { renderHeading() }
                    </div>
                    { list }
                </div>
                {
                    bottom &&
                    <div className="bottom">
                        { bottom }
                    </div>
                }
            </div>
            {
                canShowCloseArea &&
                <div className={`closeArea ${contentVisible ? "open" : "closed"}`} onClick={() => setContentVisible(false)}></div>
            }
        </Panel>
    )
}