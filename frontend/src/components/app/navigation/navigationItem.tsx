import {ForwardRefExoticComponent, ReactElement, ReactNode} from "react"
import {LucideProps} from "lucide-react"
import Link from "next/link"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"

export default function NavigationItem({
    Icon,
    action,
    description,
    badge,
    selected
}:{
    Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">>
    action: string | (() => void)
    description: ReactNode
    badge?: string | number
    selected?: boolean | undefined
}){
    const renderAction = (children: ReactElement) => {
        const className = `navigationItem ${selected == true && "selected"}`

        if(typeof action === "string"){
            return <Link href={action} className={className}>{children}</Link>
        }else{
            return <button onClick={action} className={className}>{children}</button>
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