import React, {ReactNode, useEffect, useLayoutEffect, useRef} from "react"
import "./collapse.scss"

//TODO doesnt handle sidebar responsiveness well, needs more height recalculations
export default function Collapse({
    children,
    expanded,
    recalculateHeightWith = [],
    className
}:{
    children: ReactNode
    expanded: boolean
    recalculateHeightWith?: any[]
    className?: string
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
     * Fallback: if `expanded` becomes true but no CSS transition runs
     * AI
     */
    useEffect(() => {
        const el = ref.current
        if (!el || !expanded) return

        let transitionStarted = false

        const onTransitionRun = (e: TransitionEvent) => {
            if (e.propertyName === "height") transitionStarted = true
        }

        el.addEventListener("transitionrun", onTransitionRun)

        // Two rAFs ensure the browser has had a chance to start a transition.
        // If none started by then, it won't — set overflow immediately.
        const raf = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.removeEventListener("transitionrun", onTransitionRun)
                if (!transitionStarted && el.classList.contains("expanded")) {
                    el.style.overflow = "visible"
                }
            })
        })

        return () => {
            cancelAnimationFrame(raf)
            el.removeEventListener("transitionrun", onTransitionRun)
        }
    }, [expanded])

    useLayoutEffect(() => {
        if(!ref.current) return

        ref.current.style.height = "auto"
        ref.current.style.transition = "none"
        ref.current.style.boxSizing = "border-box"

        const rect = ref.current.getBoundingClientRect()

        ref.current.style.height = ""
        ref.current.style.transition = ""
        ref.current.style.boxSizing = ""

        if(rect.height == 0) return

        ref.current.style.setProperty("--expanded-height", rect.height + "px")
    }, recalculateHeightWith)

    return (
        <div className={`collapsableContent ${expanded && "expanded"} ${className}`} ref={ref}>
            {children}
        </div>
    )
}

