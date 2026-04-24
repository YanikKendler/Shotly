import {CHANGELOG} from "@/data/changelog"
import {marked} from "marked"
import Utils from "@/utility/Utils"
import Link from "next/link"

export default function ChangeLogFloater({
    hideFloater
}:{
    hideFloater: () => void
}){
    return (
        <div className="changelog">
            <div className={"top"}>
                <h3>Whats new?</h3>
                <span className={"bold small gray"}>Shotly v{CHANGELOG[0].version}</span>
            </div>
            <div dangerouslySetInnerHTML={{__html: marked.parse(Utils.cleanMarkdownString(CHANGELOG[0].changes))}}></div>
            <div className="buttons">
                <button
                    onClick={hideFloater}
                    className={"main"}
                >
                    Close
                </button>
                <Link href={"/changelog"} target={"_blank"} className={"secondary"}>Changelog</Link>
            </div>
        </div>
    )
}