import {ForwardRefExoticComponent, ReactElement, ReactNode} from "react"
import {LucideProps} from "lucide-react"
import Link from "next/link"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"

export default function NavigationItem({
    Icon,
    action,
    description,
    badge
}:{
    Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">>
    action: string | (() => void)
    description: ReactNode
    badge?: string | number
}){
    const renderAction = (children: ReactElement) => {
        if(typeof action === "string"){
            return <Link href={action}>{children}</Link>
        }else{
            return <button onClick={action}>{children}</button>
        }
    }

    return (
        <SimpleTooltip delay={50} content={description} side={"right"} offset={5}>
            {
                renderAction(
                    <>
                        <Icon size={22} strokeWidth={2.3}/>
                        {badge && <span className={"badge"}>{badge}</span>}
                    </>
                )
            }
        </SimpleTooltip>
    )
}