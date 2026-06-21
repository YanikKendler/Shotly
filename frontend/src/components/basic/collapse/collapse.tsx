import React, {ReactNode, useEffect, useLayoutEffect, useRef} from "react"
import "./collapse.scss"

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

    const layoutEffectRan = useRef(false);
    const useEffectRan = useRef(false);
    const mountTime = useRef(Date.now());

    /**
     * Removes overflow hidden from the content while it is expanded
     * to allow popovers or similar to be displayed correctly
     */
    useEffect(() => {
        if(!ref.current || useEffectRan.current) return

        useEffectRan.current = true

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
            else {
                ref.current.style.overflow = ""
            }
        }

        ref.current.addEventListener("transitionend", onTransitionEnd)
        ref.current.addEventListener("transitionrun", onTransitionStart)

        return () => {
            ref.current?.removeEventListener("transitionend", onTransitionEnd)
            ref.current?.removeEventListener("transitionrun", onTransitionStart)
        }
    }, [ref.current])

    /**
     * Fallback: if `expanded` becomes true but no CSS transition runs
     * AI
     */
    useEffect(() => {
        const el = ref.current
        if (!el || !expanded) return

        // 1. Ignore entirely if the component is older than 3 seconds (3000ms)
        const isOlderThan3Seconds = Date.now() - mountTime.current > 3000;
        if (isOlderThan3Seconds) return;

        let transitionStarted = false

        const onTransitionRun = (e: TransitionEvent) => {
            if (e.propertyName === "height") transitionStarted = true
        }

        el.addEventListener("transitionrun", onTransitionRun)

        // 2. Lower Priority: Use setTimeout instead of requestAnimationFrame.
        // 50ms is plenty of time for the browser to trigger 'transitionrun'
        // without blocking the main rendering thread.
        const timer = setTimeout(() => {
            el.removeEventListener("transitionrun", onTransitionRun)

            if (!transitionStarted && el.classList.contains("expanded")) {
                el.style.overflow = "visible"
            }
        }, 50)

        return () => {
            clearTimeout(timer)
            el.removeEventListener("transitionrun", onTransitionRun)
        }
    }, [expanded])

    useLayoutEffect(() => {
        if(!ref.current || layoutEffectRan.current) return

        ref.current.style.height = "auto"
        ref.current.style.transition = "none"
        ref.current.style.boxSizing = "border-box"

        const rect = ref.current.getBoundingClientRect()

        ref.current.style.height = ""
        ref.current.style.transition = ""
        ref.current.style.boxSizing = ""

        if(rect.height == 0) return

        layoutEffectRan.current = true

        ref.current.style.setProperty("--expanded-height", rect.height + "px")
    }, [recalculateHeightWith, ref.current])

    return (
        <div className={`collapsableContent ${expanded && "expanded"} ${className}`} ref={ref}>
            {children}
        </div>
    )
}

