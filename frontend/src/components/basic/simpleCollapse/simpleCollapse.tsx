import {ChevronDown} from "lucide-react"
import {forwardRef, ReactNode, useImperativeHandle, useState} from "react"
import Collapse from "@/components/basic/collapse/collapse"
import "./simpleCollapse.scss"

export interface SimpleCollapseRef {
    setIsExpanded: (isExpanded: boolean) => void
}

export interface SimpleCollapseProps {
    name: string,
    defaultExpanded?: boolean,
    className?: string
    contentClassName?: string
    children: ReactNode,
}

const SimpleCollapse = forwardRef<SimpleCollapseRef, SimpleCollapseProps>(({
    name,
    defaultExpanded,
    className,
    contentClassName,
    children
},ref) =>{
    const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded ?? false)

    useImperativeHandle(ref, () => ({
        setIsExpanded: expanded => setIsExpanded(expanded)
    }))

    return (
        <div className={`simpleCollapse ${isExpanded && "expanded"} ${className}`}>
            <button className="default noClickFx" onClick={()=> setIsExpanded(!isExpanded)}>
                <ChevronDown size={18} className={"chevron"}/>
                <div className="left">
                    <p>{name}</p>
                </div>
            </button>
            <Collapse expanded={isExpanded} recalculateHeightWith={[children]} className={contentClassName}>
                {children}
            </Collapse>
        </div>
    )
})

export default SimpleCollapse