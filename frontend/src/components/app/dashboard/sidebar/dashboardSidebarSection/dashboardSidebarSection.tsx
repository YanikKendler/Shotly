import {Collapsible} from "radix-ui"
import {ChevronDown} from "lucide-react"
import Skeleton from "react-loading-skeleton"
import {ReactNode, useEffect, useLayoutEffect, useState} from "react"
import Link from "next/link"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import "./dashboardSidebarSection.scss"
import Collapse from "@/components/basic/collapse/collapse"

export interface DashboardSidebarSectionEntry {
    name?: string | null
    link: string
    icon: ReactNode
}

export default function DashboardSidebarSection({
    title,
    isLoading,
    empty,
    entries
}:{
    title: string
    isLoading: boolean
    empty: ReactNode
    entries: DashboardSidebarSectionEntry[]
}) {
    const [expanded, setExpanded] = useState(true)

    return (
        <div className={"sidebarSection"}>
            <button className={"noClickFx"} onClick={() => setExpanded(!expanded)}>
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
                                    <Link href={entry.link}>
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