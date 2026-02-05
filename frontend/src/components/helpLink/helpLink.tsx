import Link from "next/link"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"
import "./helpLink.scss"
import {td} from "@/service/Analytics"

export default function HelpLink({
    link,
    floating = false,
    delay
}: {
    link: string
    floating?: boolean
    delay?: number
}) {
    return (
        <SimpleTooltip text={"Click to open the relevant documentation"} fontSize={0.8} offset={0} delay={delay}>
            <Link
                href={link}
                target="_blank"
                className={`helpLink ${floating && "floating"}`}
                onClick={() => {td.signal("HelpLink", {link: link})}}
            >?</Link>
        </SimpleTooltip>
    )
}