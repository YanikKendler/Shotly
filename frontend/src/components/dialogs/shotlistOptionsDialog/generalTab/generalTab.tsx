import {ShotlistDto, UserDto} from "../../../../../lib/graphql/generated"
import React, {useState} from "react"
import gql from "graphql-tag"
import {wuGeneral, wuTime} from "@yanikkendler/web-utils"
import {useApolloClient} from "@apollo/client"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialog"
import {useRouter} from "next/navigation"
import "./generalTab.scss"
import TextField from "@/components//inputs/textField/textField"
import Loader from "@/components/feedback/loader/loader"
import Separator from "@/components/separator/separator"
import DotLoader from "@/components/DotLoader"
import {errorNotification} from "@/service/NotificationService"

export default function GeneralTab({
    shotlist,
    setShotlist,
    dataChanged,
    isReadOnly,
    currentUser,
}: {
    shotlist: ShotlistDto | null,
    setShotlist: (shotlist: ShotlistDto) => void,
    dataChanged: () => void,
    isReadOnly: boolean,
    currentUser: UserDto | null,
}) {
    const client = useApolloClient()
    const { confirm, ConfirmDialog } = useConfirmDialog();
    const router = useRouter()

    const [deleting, setDeleting] = useState(false)

    const updateShotlistName = async (name: string) => {
        if(!shotlist) return

        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation updateShotlistName($shotlistId: String!, $name: String!) {
                    updateShotlist(editDTO: {
                        id: $shotlistId
                        name: $name
                    }){
                        id
                        name
                    }
                }
            `,
            variables: { shotlistId: shotlist.id, name: name.trim() },
        });

        if (errors) {
            errorNotification({
                title: "Failed to update shotlist name",
                tryAgainLater: true
            })
            console.error(errors);
            return;
        }

        setShotlist({
            ...shotlist,
            name: data.updateShotlist.name
        })

        dataChanged()
    }

    const debounceUpdateShotlistName = wuGeneral.debounce(updateShotlistName)

    const deleteShotlist = async () => {
        if(!shotlist) return

        let decision = await confirm({
            title: 'Are you absolutely sure?',
            message: `Do you want to delete the shotlist "${shotlist.name}" and its ${shotlist.sceneCount} scenes and ${shotlist.shotCount} shots? I recommend exporting to csv before deleting. This action cannot be undone.`,
            buttons: {
                confirm: {
                    text: 'Delete Shotlist',
                    className: 'bad'
                }
            },
            checkbox: true
        })

        if(!decision) return

        setDeleting(true)

        const { errors } = await client.mutate({
            mutation: gql`
                mutation deleteShotlist($id: String!) {
                    deleteShotlist(id: $id) {
                        id
                    }
                }
            `,
            variables: { id: shotlist.id },
        });

        if(errors) {
            errorNotification({
                title: "Failed to delete shotlist",
                tryAgainLater: true
            })
            console.error(errors)
            setDeleting(false)
        }
        else{
            router.push("/dashboard")
        }
    }

    if(!shotlist) return (<Loader/>)

    if(deleting) return <div className={"shotlistOptionsDialogGeneralTab"}>
        <Loader text={"Deleting shotlist..."}/>
    </div>

    return (
        <div className={"shotlistOptionsDialogGeneralTab"}>
            <h2>Shotlist settings</h2>
            <TextField
                label={"Name"}
                value={shotlist.name || ""}
                placeholder={"My shotlist"}
                valueChange={debounceUpdateShotlistName}
                disabled={isReadOnly}
            />

            <Separator/>

            <div className="details">
                <p>Created at: <b>{wuTime.toDateTimeString(shotlist.createdAt)}</b> by: <b>{shotlist.owner?.name}</b></p>
                <p>Last edited at: <b>{wuTime.toDateTimeString(shotlist.editedAt) || "Unkown"}</b></p>
                <p><b>{shotlist.sceneCount}</b> scene{shotlist.sceneCount == 1 ? "" : "s"} • <b>{shotlist.shotCount}</b> shot{shotlist.shotCount == 1 ? "" : "s"}</p>
                {
                    shotlist.template &&
                    <p>Based on Template: <b>{shotlist.template.name}</b></p>
                }
            </div>

            {
                shotlist.owner?.id == currentUser?.id &&
                <>
                    <Separator className={"dangerZone"}/>
                    <div className="row">
                        <p>Permanently delete the shotlist "{shotlist.name}"</p>
                        <button
                            disabled={isReadOnly}
                            className="deleteShotlist bad"
                            onClick={deleteShotlist}
                        >
                            Delete Shotlist
                        </button>
                    </div>
                </>
            }
            {ConfirmDialog}
        </div>
    )
}