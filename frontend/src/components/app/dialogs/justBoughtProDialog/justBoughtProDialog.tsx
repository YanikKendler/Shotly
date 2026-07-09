import {useRouter, useSearchParams} from "next/navigation"
import React, {useContext, useEffect, useRef, useState} from "react"
import "./justBoughtProDialog.scss"
import {DashboardContext, DialogStep} from "@/context/DashboardContext"
import Config from "@/Config"
import Dialog, {DialogRef} from "@/components/basic/dialog/dialog"
import {PartyPopper, Rocket} from "lucide-react"

export default function JustBoughtProDialog(){
    const router = useRouter()
    const dashboardContext = useContext(DashboardContext)

    const searchParams = useSearchParams()
    const justBoughtPro = searchParams?.get('jbp') === 'true'

    const dialogRef = useRef<DialogRef>(null);

    useEffect(() => {
        if(dashboardContext.dialogStep !== DialogStep.PRO) return

        if (justBoughtPro || Config.OVERRIDE_INTRO_CHECKS) {
            dialogRef.current?.setOpen(true)
        }
        else{
            dashboardContext.incrementDialogStep(DialogStep.PRO)
        }
    }, [dashboardContext.dialogStep])

    return (
        <Dialog
            ref={dialogRef}
            onOpenChange={isOpen => {
                if(!isOpen) {
                    dashboardContext.incrementDialogStep(DialogStep.PRO)

                    router.replace("/dashboard")
                }
            }}
            contentClassName={"justBoughtProDialogContent"}
        >
            <h2>Thank you for subscribing to Shotly Pro!</h2>
            <div className="iconContainer">
                <div className="left">
                    <p className={"financing"}>You are financing the development and server costs of Shotly, I am very grateful for that.</p>
                    <p className={"issues"}>I hope you are satisfied with your purchase! If you do however encounter any problems, please don't hesitate to contact me via the help menu in the bottom right.</p>
                </div>
                <Rocket size={80} strokeWidth={1.25} className={"icon"}/>
            </div>
            <button onClick={() => dialogRef.current?.setOpen(false)}>Start creating</button>
        </Dialog>
    )
}