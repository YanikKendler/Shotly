import { Panel } from "react-resizable-panels";
import {cloneElement, ReactElement, useState} from "react"
import Navigation from "@/components/app/navigation/navigation"
import Skeleton from "react-loading-skeleton"
import "./sidebar.scss"

//TODO handle responsiveness
export default function Sidebar({
    className,
    additionalNavItems,
    heading,
    list,
    bottom,
    isLoading,
    onCollaborationAccepted
}:{
    className: string
    additionalNavItems?: ReactElement
    heading: string | ReactElement
    list: ReactElement
    bottom?: ReactElement
    isLoading: boolean
    onCollaborationAccepted?: () => void
}){
    const [isOpen, setIsOpen] = useState(true)

    const renderHeading = () => {
        if(isLoading) return <Skeleton height={"2rem"}/>

        if(typeof heading == "string") return <h1 className={"heading"}>{heading}</h1>
        else return cloneElement(heading, {
            // @ts-ignore
            className: `${heading.props.className || ''} heading`.trim()
        })
    }

    return (
        <Panel
            defaultSize={20}
            maxSize={40}
            minSize={12}
            className={`sidebar collapse ${isOpen ? "open" : "closed"} ${className}`}
        >
            <Navigation
                onCollaborationAccepted={onCollaborationAccepted}
            >
                {additionalNavItems}
            </Navigation>
            <div className="content">
                <div className={`top`}>
                    { renderHeading() }
                    { list }
                </div>
                {
                    bottom &&
                    <div className="bottom">
                        { bottom }
                    </div>
                }
            </div>
        </Panel>
    )
}