import { Tooltip } from "radix-ui";
import {ReactNode} from "react"
import "./simpleTooltip.scss"


export default function SimpleTooltip({
    children,
    text,
    hoverAreaExpansion,
    showHoverArea = true,
    asButton = false,
    delay
}: {
    children: ReactNode
    text: string
    hoverAreaExpansion?: number
    showHoverArea?: boolean
    asButton?: boolean
    delay?: number

}){
    return (
        <Tooltip.Root delayDuration={delay}>
            <Tooltip.Trigger asChild>
                {
                    asButton ?
                    (
                        <span
                            className="simpleTooltipTrigger"
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
                <Tooltip.Content className="TooltipContent" sideOffset={2}>
                    {text}
                    <Tooltip.Arrow className="TooltipArrow" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    )
}