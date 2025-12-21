import { Tooltip } from "radix-ui";
import {ReactNode} from "react"
import "./simpleTooltip.scss"


export default function SimpleTooltip({
    children,
    text,
    hoverAreaExpansion
}: {
    children: ReactNode
    text: string
    hoverAreaExpansion?: number
}){
    return (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                <span
                    className="simpleTooltipTrigger"
                >
                    {children}
                    <span className={"expansion"} style={{inset: `-${hoverAreaExpansion || 5}px`}}>
                    </span>
                </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content className="TooltipContent" sideOffset={2}>
                    {text}
                    <Tooltip.Arrow className="TooltipArrow" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    )
}