import {ChevronDown} from "lucide-react"
import Skeleton from "react-loading-skeleton"
import {ReactNode, useEffect, useLayoutEffect, useState} from "react"
import Link from "next/link"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import "./dashboardSidebarSection.scss"
import Collapse from "@/components/basic/collapse/collapse"

export interface DashboardSidebarSectionEntry {
    id?: string | null
    name?: string | null
    link: string
    icon: ReactNode
}

export default function DashboardSidebarSection({
    title,
    isLoading,
    empty,
    entries,
    selectedId
}:{
    title: string
    isLoading: boolean
    empty: ReactNode
    entries: DashboardSidebarSectionEntry[]
    selectedId?: string
}) {
    const [expanded, setExpanded] = useState(true)

    useEffect(() => {
        checkAutoExpand()
    }, [selectedId]);

    const checkAutoExpand = () => {
        if(selectedId && entries?.some(e => e.id == selectedId)) {
            setExpanded(true)
            return true
        }

        return false
    }

    const toggleExpand = () => {
        if(checkAutoExpand()) return

        setExpanded(!expanded)
    }

    //TODO maybe make section headings fullcaps
    return (
        <div className={"sidebarSection"}>
            <button className={"collapseButton noClickFx"} onClick={toggleExpand}>
                {title} <ChevronDown size={18} className={"chevron"}/>
            </button>
            <Collapse expanded={expanded} recalculateHeightWith={[isLoading, entries]}>
                {
                    isLoading ? <>
                            <Skeleton height={"1.5rem"}/>
                            <Skeleton height={"1.5rem"}/>
                        </>
                        :
                        !entries || entries.length <= 0 ? empty
                            :
                            entries.map((entry, index) =>
                                <SimpleTooltip text={entry.name || "Unnamed"} key={index}>
                                    <Link href={entry.link} className={`entry ${selectedId && entry.id == selectedId && "selected"}`}>
                                        {entry.icon}
                                        {entry.name
                                            ? <span className={"truncate"}>{entry.name}</span>
                                            : <span className={"italic"}>Unnamed</span>
                                        }
                                    </Link>
                                </SimpleTooltip>
                            )
                }
            </Collapse>
        </div>
    )
}