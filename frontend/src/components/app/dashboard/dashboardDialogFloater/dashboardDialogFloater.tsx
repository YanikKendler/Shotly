import {ReactNode, useEffect, useRef} from "react"
import Dialog, {DialogRef} from "@/components/basic/dialog/dialog"
import "./dashboardDialogFloater.scss"

export default function DashboardDialogFloater({
    children,
    visible
}:{
    children: ReactNode
    visible: boolean
}){
    if(visible)
        return (
            <div className={"dashboardDialogFloater floating"}>
                {children}
            </div>
        )
}