import React, {ReactNode, useState} from "react"
import {Collapsible} from "radix-ui"
import {ChevronDown} from "lucide-react"
import "./collapse.scss"

export default function Collapse({
    children,
    name,
    defaultOpen = false
}:{
    children: ReactNode
    name: string
    defaultOpen?: boolean
}){
    const [isOpen, setIsOpen] = useState<boolean>(defaultOpen)

    return (
        <Collapsible.Root onOpenChange={setIsOpen} defaultOpen={defaultOpen} className={"simpleCollapse"}>
            <Collapsible.Trigger className={"trigger noClickFx"}>
                <ChevronDown size={18} className={"chevron"}/>
                <div className="left">
                    <p>{name}</p>
                </div>
            </Collapsible.Trigger>
            <Collapsible.Content className={"content"}>
                {children}
            </Collapsible.Content>
        </Collapsible.Root>
    )
}

