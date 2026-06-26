import { Tooltip } from "radix-ui";
import {ReactNode, useState} from "react"
import "./simpleTooltip.scss"


export default function SimpleTooltip({
    children,
    text,
    content,
    fontSize = 0.85,
    offset = 6,
    hoverAreaExpansion,
    showHoverArea = true,
    asButton = false,
    buttonClassname = "",
    delay = 500,
    canOpen = true,
    side = "top",
    forceOpen = false,
    showOnMobile = false
}: {
    children: ReactNode
    text?: string
    content?: ReactNode
    fontSize?: number
    offset?: number
    hoverAreaExpansion?: number
    showHoverArea?: boolean
    asButton?: boolean
    buttonClassname?: string
    delay?: number
    canOpen?: boolean
    side?: "top" | "right" | "bottom" | "left"
    forceOpen?: boolean
    showOnMobile?: boolean
}){
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Tooltip.Root delayDuration={delay} open={isOpen || forceOpen} onOpenChange={setIsOpen}>
            <Tooltip.Trigger
                asChild
                onClick={() => {
                    if(showOnMobile) setIsOpen(current => !current)
                }}
            >
                {
                    asButton ?
                    (
                        <span
                            className={`simpleTooltipTrigger ${buttonClassname}`}
                        >
                            {children}
                            {
                                showHoverArea &&
                                <span className={"expansion"} style={{inset: `-${hoverAreaExpansion || 5}px`}}/>
                            }
                        </span>
                    ) :
                    children
                }
            </Tooltip.Trigger>
            <Tooltip.Portal>
                {
                    canOpen &&
                    <Tooltip.Content
                        className={`tooltipContent ${showOnMobile && "showOnMobile"}`}
                        sideOffset={offset}
                        style={{fontSize: fontSize + "rem"}}
                        side={side}
                        align={"center"}
                    >
                        <div className="scrollArea">
                            {text ?? text}
                            {content ?? content}
                        </div>
                        {/*<Tooltip.Arrow className="arrow"/>*/}
                    </Tooltip.Content>
                }
            </Tooltip.Portal>
        </Tooltip.Root>
    )
}