import SimplePage from "@/components/simplePage/simplePage"
import {CHANGELOG} from "@/data/changelog"
import {marked} from "marked"
import Utils from "@/util/Utils"

export default function freeForStudents(){
    return (
        <SimplePage>
            <title>Shotly | Changelog</title>
            <h1>Changelog</h1>

            {
                CHANGELOG.map(change => (
                    <div key={change.version}>
                        <h2>{change.version}</h2>
                        <div dangerouslySetInnerHTML={{__html: marked.parse(Utils.cleanMarkdownString(change.changes))}}></div>
                    </div>
                ))
            }
        </SimplePage>
    )
}