import {ShotlistDto} from "../../../../../lib/graphql/generated"
import {Separator} from "radix-ui"
import React from "react"
import gql from "graphql-tag"
import {wuGeneral, wuTime} from "@yanikkendler/web-utils"
import {useApolloClient} from "@apollo/client"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialoge"
import {useRouter} from "next/navigation"
import "./generalTab.scss"
import TextField from "@/components//inputs/textField/textField"
import Loader from "@/components/feedback/loader/loader"

export default function GeneralTab({
    shotlist,
    setShotlist,
    dataChanged,
    isReadOnly
}: {
    shotlist: ShotlistDto | null,
    setShotlist: (shotlist: ShotlistDto) => void,
    dataChanged: () => void,
    isReadOnly: boolean
}) {
    const client = useApolloClient()
    const { confirm, ConfirmDialog } = useConfirmDialog();
    const router = useRouter()

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
            console.error(errors)
        }
        else{
            router.push("/dashboard")
        }
    }

    if(!shotlist) return (<Loader/>)

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

            <Separator.Root className={"Separator"}></Separator.Root>

            <div className="details">
                <p>Created at <b>{wuTime.toFullDateTimeString(shotlist.createdAt)}</b> by <b>{shotlist.owner?.name}</b></p>
                <p>Last edited at: <b>{wuTime.toFullDateTimeString(shotlist.editedAt)}</b></p>
                <p><b>{shotlist.sceneCount}</b> scenes • <b>{shotlist.shotCount}</b> shots</p>
            </div>

            <Separator.Root className={"Separator dangerZone"}></Separator.Root>

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
            {ConfirmDialog}
        </div>
    )
}