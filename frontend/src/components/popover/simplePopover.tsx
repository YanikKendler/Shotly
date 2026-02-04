import { Popover } from "radix-ui";
import {ReactNode} from "react"
import "./simplePopover.scss"

export default function SimplePopover({
    children,
    text,
    content,
    fontSize = 0.9,
    offset = 2,
    asChild = false,
    side = "top",
    className = "",
    contentClassName = "",
    onOpen = () => {}
} : {
    children: ReactNode
    text?: string
    content?: ReactNode
    fontSize?: number
    offset?: number
    asChild?: boolean
    side?: "top" | "right" | "bottom" | "left",
    className?: string
    contentClassName?: string
    onOpen?: () => void
}){
    return (
        <Popover.Root onOpenChange={(open) => {
            if(open)
                onOpen()
        }}>
            <Popover.Trigger asChild={asChild} className={`popoverTrigger ${className}`}>
                {children}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className={`popoverContent noScroll ${contentClassName}`}
                    sideOffset={offset}
                    side={side}
                    style={{fontSize: fontSize + "rem"}}
                >
                    <Popover.Arrow className="popoverArrow"/>
                    <div className="scrollArea">
                        {text ?? text}
                        {content ?? content}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}