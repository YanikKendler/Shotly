import React, {ReactNode, useLayoutEffect, useRef} from "react"
import "./collapse.scss"

export default function Collapse({
    children,
    expanded,
    recalculateHeightWith
}:{
    children: ReactNode
    expanded: boolean
    recalculateHeightWith?: any
}){
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if(!ref.current) return

        ref.current.style.height = "auto"

        const rect = ref.current.getBoundingClientRect()

        ref.current.style.height = ""

        if(rect.height == 0) return

        ref.current.style.setProperty("--expanded-height", rect.height + "px")
    }, [recalculateHeightWith])

    return (
        <div className={`collapsableContent ${expanded && "expanded"}`} ref={ref}>
            {children}
        </div>
    )
}

