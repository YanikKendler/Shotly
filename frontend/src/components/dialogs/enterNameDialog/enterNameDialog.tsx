import {Dialog} from "radix-ui";
import TextField from "@/components/inputs/textField/textField"
import React, {useContext, useEffect, useState} from "react"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {errorNotification} from "@/service/NotificationService"
import "./enterNameDialog.scss"
import {DashboardContext, DialogStep} from "@/context/DashboardContext"

export default function EnterNameDialog(){
    const client = useApolloClient()
    const dashboardContext = useContext(DashboardContext)

    const [dialogOpen, setDialogOpen] = useState(false)
    const [newName, setNewName] = useState<string>("")

    useEffect(() => {
        if(!dashboardContext.query.data.currentUser) return

        if(dashboardContext.dialogStep !== DialogStep.NAME) return

        console.log("inspecting need for enter name dialog")

        const email = dashboardContext.query.data.currentUser?.email
        const name = dashboardContext.query.data.currentUser?.name

        if(name && email && name == email){
            setDialogOpen(true)
        }
        else{
            dashboardContext.incrementDialogStep()
            console.log("skipping enter name dialog")
        }
    }, [dashboardContext.dialogStep, dashboardContext.query.data])

    const handleNewUserName = async () => {
        if(wuConstants.Regex.empty.test(newName)) return

        const {data, errors} = await client.mutate({
                mutation: gql`
                    mutation updateUser($name: String!){
                        updateUser(editDTO: {
                            name: $name
                        }) {
                            id
                            name
                        }
                    }`,
                variables: {name: newName.trim()},
            },
        )

        if(errors) {
            errorNotification({
                title: "Failed to update Username",
                tryAgainLater: true
            })
            console.error("Error updating username:", errors);
            //no return on purpose, will show up again on next visit
        }

        setDialogOpen(false)
        dashboardContext.incrementDialogStep()
    }

    return (
        <Dialog.Root open={dialogOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className={"dialogOverlay"}/>
                <Dialog.Content
                    aria-describedby={"enter name dialog"}
                    className={"enterNameDialogContent dialogContent"}
                >
                    <Dialog.Title className={"title"}>Welcome to Shotly!</Dialog.Title>
                    <p>
                        <span className="bold">Please enter your name (or nickname) to continue.</span>
                        <br/>
                        <span className="gray">This name will be visible to all collaborators and can not be used to log in.</span>
                    </p>
                    <TextField
                        value={newName}
                        valueChange={setNewName}
                        label={"Your name"}
                        maxWidth={"100%"}
                        placeholder={"Quentin Tarantino"}
                        color={"accent"}
                    />
                    <p className={"small"}>You can always change your name in the Account settings.</p>

                    <button
                        disabled={wuConstants.Regex.empty.test(newName)}
                        onClick={handleNewUserName}
                    >
                        Done
                    </button>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}