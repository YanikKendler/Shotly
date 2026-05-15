import React, {ReactNode, RefObject, UIEventHandler} from "react"
import { ScrollArea as RadixScrollArea } from "radix-ui"
import "./scrollArea.scss"

export default function ScrollArea({
    children,
    viewportRef,
    onScroll,
    onScrollEnd,
    className
}:{
    children: ReactNode
    viewportRef?: RefObject<HTMLDivElement | null>
    onScroll?: UIEventHandler<HTMLDivElement>
    onScrollEnd?: UIEventHandler<HTMLDivElement>
    className?: string
}){
    return (
        <RadixScrollArea.Root
            className={`scrollArea ${className}`}
        >
            <RadixScrollArea.Viewport
                className="viewport"
                onScroll={onScroll}
                onScrollEnd={onScrollEnd}
                ref={viewportRef}
            >
                {children}
            </RadixScrollArea.Viewport>
            <RadixScrollArea.Scrollbar orientation="horizontal" className="scrollbar">
                <RadixScrollArea.Thumb className="scrollThumb"/>
            </RadixScrollArea.Scrollbar>
            <RadixScrollArea.Scrollbar orientation="vertical" className="scrollbar">
                <RadixScrollArea.Thumb className="scrollThumb"/>
            </RadixScrollArea.Scrollbar>
            <RadixScrollArea.Corner className="corner"/>
        </RadixScrollArea.Root>
    )
}