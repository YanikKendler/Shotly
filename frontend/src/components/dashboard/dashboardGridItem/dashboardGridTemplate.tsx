import {TemplateDto} from "../../../../lib/graphql/generated"
import Link from "next/link"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"
import {Blocks} from "lucide-react"
import "./dashboardGridItem.scss"

export default function DashboardGridTemplate({template}:{template: TemplateDto}){
    return <Link href={`/dashboard/template/${template.id}`} className="dashboardGridItem template">
        <SimpleTooltip text={template.name || "Unnamed"}>
            <div className="top">
                <Blocks size={18}/>
                <p className={"name"} role={"heading"}>{template.name || <span className='italic'>Unnamed</span>}</p>
            </div>
        </SimpleTooltip>
        <p>
            {"Scenes: "}
            <span className={"bold"}>
                {template.sceneAttributeCount} Attribute{template.sceneAttributeCount && template.sceneAttributeCount === 1 ? "" : "s"}
            </span>
        </p>
        <p>
            {"Shots: "}
            <span className={"bold"}>
                {template.shotAttributeCount} Attribute{template.shotAttributeCount && template.shotAttributeCount === 1 ? "" : "s"}
            </span>
        </p>
        <p>
            {"Created by:"}
            <SimpleTooltip text={template.owner?.email || "Unknown email"}><span className={"bold"}>{template.owner?.name}</span></SimpleTooltip>
        </p>
    </Link>
}