import {useRouter, useSearchParams} from "next/navigation"
import React, {useContext, useEffect, useState} from "react"
import {Dialog} from "radix-ui"
import "./justBoughtProDialog.scss"
import {DashboardContext, DialogStep} from "@/context/DashboardContext"

export default function JustBoughtProDialog(){
    const router = useRouter()
    const dashboardContext = useContext(DashboardContext)

    const searchParams = useSearchParams()
    const justBoughtPro = searchParams?.get('jbp') === 'true'
    const [justBoughtProDialogOpen, setJustBoughtProDialogOpen] = useState<boolean>(justBoughtPro)

    useEffect(() => {
        if(dashboardContext.dialogStep != DialogStep.PRO) return

        if (justBoughtPro) {
            setJustBoughtProDialogOpen(true)
        }
        else{
            dashboardContext.incrementDialogStep()
            console.log("skipping just bought pro dialog")
        }
    }, [dashboardContext.dialogStep])

    const handleJustBoughtProDialogOpenChange = (newOpen: boolean)=> {
        setJustBoughtProDialogOpen(newOpen)

        if(newOpen == false) {
            router.replace("/dashboard")
            dashboardContext.incrementDialogStep()
        }
    }

    return (
        <Dialog.Root open={justBoughtProDialogOpen} onOpenChange={handleJustBoughtProDialogOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className={"dialogOverlay"}/>
                <Dialog.Content
                    aria-describedby={"just bought pro dialog"}
                    className={"justBoughtProDialogContent dialogContent"}

                >
                    <Dialog.Title className={"title"}>Thank you for subscribing to Shotly Pro!</Dialog.Title>
                    <p className={"financing"}>You are financing the development and server costs of Shotly, I am very grateful for that.</p>
                    <p className={"issues"}>I hope you are satisfied with your Purchase! If you do however encounter any problems, please open an issue via the account tab.</p>
                    <button onClick={() => handleJustBoughtProDialogOpenChange(false)}>Start creating</button>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}