import {ChevronDown} from "lucide-react"
import {ReactNode, useState} from "react"
import Collapse from "@/components/basic/collapse/collapse"
import "./simpleCollapse.scss"

export default function SimpleCollapse({
    name,
    defaultExpanded,
    children
}:{
    name: string,
    defaultExpanded?: boolean,
    children: ReactNode
}){
    const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded ?? false)

    return (
        <div className={`simpleCollapse ${isExpanded && "expanded"}`}>
            <button className="default noClickFx" onClick={()=> setIsExpanded(!isExpanded)}>
                <ChevronDown size={18} className={"chevron"}/>
                <div className="left">
                    <p>{name}</p>
                </div>
            </button>
            <Collapse expanded={isExpanded} recalculateHeightWith={[children]}>
                {children}
            </Collapse>
        </div>
    )
}