import SimplePage from "@/components/app/simplePage/simplePage"
import {CHANGELOG} from "@/data/changelog"
import {marked} from "marked"
import Utils from "@/utility/Utils"
import {wuTime} from "@yanikkendler/web-utils"

export default function freeForStudents(){
    return (
        <SimplePage>
            <title>Shotly | Changelog</title>
            <h1>Changelog</h1>

            {
                CHANGELOG.map(change => (
                    <div key={change.version}>
                        <h2>{change.version} <span className="chip small">{wuTime.toDateString(change.date, {yearDigits: 4})}</span></h2>
                        <div dangerouslySetInnerHTML={{__html: marked.parse(Utils.trimMarkdownStringWhitespaces(change.changes))}}></div>
                    </div>
                ))
            }
        </SimplePage>
    )
}