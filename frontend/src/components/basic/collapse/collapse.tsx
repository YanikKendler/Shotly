import React, {ReactNode, useEffect, useLayoutEffect, useRef} from "react"
import "./collapse.scss"

export default function Collapse({
    children,
    expanded,
    recalculateHeightWith = []
}:{
    children: ReactNode
    expanded: boolean
    recalculateHeightWith?: any[]
}){
    const ref = useRef<HTMLDivElement>(null);

    /**
     * Removes overflow hidden from the content while it is expanded
     * to allow popovers or similar to be displayed correctly
     */
    useEffect(() => {
        if(!ref.current) return

        const onTransitionStart = (e: TransitionEvent) => {
            if(e.propertyName != "height" || !ref.current) return

            if(!ref.current.classList.contains("expanded")) {
                ref.current.style.overflow = ""
            }
        }

        const onTransitionEnd = (e: TransitionEvent) => {
            if(e.propertyName != "height" || !ref.current) return

            if(ref.current.classList.contains("expanded")) {
                ref.current.style.overflow = "visible"
            }
        }

        ref.current.addEventListener("transitionend", onTransitionEnd)
        ref.current.addEventListener("transitionrun", onTransitionStart)

        return () => {
            ref.current?.removeEventListener("transitionend", onTransitionEnd)
            ref.current?.removeEventListener("transitionrun", onTransitionStart)
        }
    }, [])

    /**
     * Remove overflow hidden on elements that are expanded per default
     */
    useEffect(() => {
        if(!expanded || !ref.current) return

        ref.current.style.overflow = "visible"
    }, []);

    useLayoutEffect(() => {
        if(!ref.current) return

        ref.current.style.height = "auto"

        const rect = ref.current.getBoundingClientRect()

        ref.current.style.height = ""

        if(rect.height == 0) return

        ref.current.style.setProperty("--expanded-height", rect.height + "px")
    }, recalculateHeightWith)

    return (
        <div className={`collapsableContent ${expanded && "expanded"}`} ref={ref}>
            {children}
        </div>
    )
}

