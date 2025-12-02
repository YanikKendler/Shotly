import React from "react"
import {useApolloClient} from "@apollo/client"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialoge"
import {useRouter} from "next/navigation"
import "./collaboratorsTab.scss"

export default function CollaboratorsTab() {
    const client = useApolloClient()
    const { confirm, ConfirmDialog } = useConfirmDialog();
    const router = useRouter()

    return (
        <div className={"shotlistOptionsDialogCollaboratorsTab"}>
            <p className={"empty"}>This feature is under development and will be available in a later version.</p>
            {ConfirmDialog}
        </div>
    )
}