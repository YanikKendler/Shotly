import {useRouter, useSearchParams} from "next/navigation"
import React, {useContext, useEffect, useState} from "react"
import {Dialog} from "radix-ui"
import "./justBoughtProDialog.scss"
import {DashboardContext, DialogStep} from "@/context/DashboardContext"
import Config from "@/util/Config"

export default function JustBoughtProDialog(){
    const router = useRouter()
    const dashboardContext = useContext(DashboardContext)

    const searchParams = useSearchParams()
    const justBoughtPro = searchParams?.get('jbp') === 'true'
    const [justBoughtProDialogOpen, setJustBoughtProDialogOpen] = useState<boolean>(justBoughtPro)

    useEffect(() => {
        if(dashboardContext.dialogStep !== DialogStep.PRO) return

        if (justBoughtPro || Config.OVERRIDE_INTRO_CHECKS) {
            setJustBoughtProDialogOpen(true)
        }
        else{
            dashboardContext.incrementDialogStep(DialogStep.PRO)
        }
    }, [dashboardContext.dialogStep])

    const closeJustBoughtProDialog = ()  => {
        dashboardContext.incrementDialogStep(DialogStep.PRO)

        setJustBoughtProDialogOpen(false)

        router.replace("/dashboard")
    }

    //not using onOpenChange because esc behaves weirdly
    return (
        <Dialog.Root open={justBoughtProDialogOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className={"dialogOverlay"}/>
                <Dialog.Content
                    aria-describedby={"just bought pro dialog"}
                    className={"justBoughtProDialogContent dialogContent"}

                >
                    <Dialog.Title className={"title"}>Thank you for subscribing to Shotly Pro!</Dialog.Title>
                    <p className={"financing"}>You are financing the development and server costs of Shotly, I am very grateful for that.</p>
                    <p className={"issues"}>I hope you are satisfied with your purchase! If you do however encounter any problems, please open an issue via the account tab.</p>
                    <button onClick={closeJustBoughtProDialog}>Start creating</button>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}