import { Tooltip } from "radix-ui";
import {ReactNode} from "react"
import "./simpleTooltip.scss"


export default function SimpleTooltip({
    children,
    text,
    content,
    fontSize = 0.9,
    offset = 2,
    hoverAreaExpansion,
    showHoverArea = true,
    asButton = false,
    delay = 500
}: {
    children: ReactNode
    text?: string
    content?: ReactNode
    fontSize?: number
    offset?: number
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
                <Tooltip.Content className="tooltipContent" sideOffset={offset} style={{fontSize: fontSize + "rem"}}>
                    <div className="scrollArea">
                        {text ?? text}
                        {content ?? content}
                    </div>
                    <Tooltip.Arrow className="tooltipArrow"/>
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    )
}