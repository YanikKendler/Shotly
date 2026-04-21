import Link from "next/link"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import "./helpLink.scss"
import {td} from "@/service/Analytics"
import SimplePopover from "@/components/basic/popover/simplePopover"
import {BookText, Bug, Lightbulb, Mail} from "lucide-react"

export default function HelpLink({
    link,
    floating = false,
    name
}: {
    link: string
    floating?: boolean
    name: string
}) {
    return (
        <SimplePopover
            asChild
            content={
                <>
                    <Link
                        href={link}
                        target="_blank"
                        onClick={() => {td.signal("HelpLink", {link: link})}}
                    >
                        <BookText size={17}/>
                        {name} Help
                    </Link>
                    <Link
                        href="https://github.com/YanikKendler/Shotly/issues/new?template=bug_report.md"
                        target="_blank"
                        onClick={() => {td.signal("HelpLink", {link: link})}}
                    >
                        <Bug size={17}/>
                        Report a Bug
                    </Link>
                    <Link
                        href="https://github.com/YanikKendler/Shotly/issues/new?template=feature_request.md"
                        target="_blank"
                        onClick={() => {td.signal("HelpLink", {link: link})}}
                    >
                        <Lightbulb size={17}/>
                        Request a Feature
                    </Link>
                    <Link
                        href="mailto:yanik@shotly.at"
                        target="_blank"
                        onClick={() => {td.signal("HelpLink", {link: link})}}
                    >
                        <Mail size={17}/>
                        Send E-mail
                    </Link>
                </>
            }
            contentClassName={"helpLinkPopoverContent"}
        >
            <span
                className={`helpLink ${floating && "floating"}`}
            >?</span>
        </SimplePopover>
    )
}