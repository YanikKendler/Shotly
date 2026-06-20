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
    const isDialogMode = window.innerWidth < 500

    const dialogRef = useRef<DialogRef>(null);

    useEffect(() => {
        dialogRef.current?.setOpen(visible);
    }, [visible]);

    if(isDialogMode)
        return <Dialog ref={dialogRef} defaultOpen={visible} contentClassName={"dashboardDialogFloater dialogMode"}>
            {children}
        </Dialog>

    return (
        <div className={"dashboardDialogFloater floating"}>
            {children}
        </div>
    )
}