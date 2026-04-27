import { Popover } from "radix-ui";
import {forwardRef, ReactNode, useImperativeHandle, useState} from "react"
import "./simplePopover.scss"

export interface SimplePopoverRef {
    open: () => void
    close: () => void
    isOpen: boolean
}

export interface SimplePopoverProps {
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
    showArrow?: boolean
    align?: "start" | "center" | "end"
}

const SimplePopover = forwardRef<SimplePopoverRef, SimplePopoverProps>(({
    children,
    text,
    content,
    fontSize = 0.9,
    offset = 2,
    asChild = false,
    side = "top",
    className = "",
    contentClassName = "",
    onOpen = () => {},
    showArrow = true,
    align = "center"
}, ref) => {
    const [isOpen, setIsOpen] = useState(false)

    useImperativeHandle(ref, () => ({
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        isOpen: isOpen
    }))

    return (
        <Popover.Root open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)

            if(open)
                onOpen()
        }}>
            <Popover.Trigger asChild={asChild} className={`popoverTrigger ${className}`}>
                {children}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className={`popoverContent noScroll ${contentClassName}`}
                    sideOffset={side == "bottom" ? offset + 4 : offset}
                    side={side}
                    align={align}
                    style={{fontSize: fontSize + "rem"}}
                    collisionPadding={10}
                >
                    {showArrow && <Popover.Arrow className="popoverArrow"/>}
                    <div className="scrollArea">
                        {text ?? text}
                        {content ?? content}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
})

export default SimplePopover