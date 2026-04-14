import {ShotlistDto} from "../../../../lib/graphql/generated"
import Link from "next/link"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"
import {NotepadText} from "lucide-react"
import {wuTime} from "@yanikkendler/web-utils"
import "./dashboardGridItem.scss"

export default function DashboardGridShotlist({shotlist}:{shotlist: ShotlistDto}){
    return <Link href={`/shotlist/${shotlist.id}`} className="dashboardGridItem shotlist">
        <SimpleTooltip text={shotlist.name || "Unnamed"}>
            <div className="top">
                <NotepadText size={18}/>
                <h3>{shotlist.name || <span className='italic'>Unnamed</span>}</h3>
            </div>
        </SimpleTooltip>
        <p className={"bold"}>
            {shotlist.sceneCount} scene{shotlist.sceneCount && shotlist.sceneCount === 1 ? "" : "s"}
            {" • "}
            {shotlist.shotCount} shot{shotlist.shotCount && shotlist.shotCount === 1 ? "" : "s"}
        </p>
        <p>Created by: <span className={"bold"}>{shotlist.owner?.name}</span></p>
        <p>
            {"Last edited: "}
            <span className={"bold"}>{wuTime.toRelativeString(shotlist.editedAt, {precision: 1, separator: ":"}) || "Unkown"}</span>
        </p>
    </Link>
}