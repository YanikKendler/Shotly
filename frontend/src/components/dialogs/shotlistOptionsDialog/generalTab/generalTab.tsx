import {ShotlistDto, UserDto} from "../../../../../lib/graphql/generated"
import React, {RefObject, useState} from "react"
import gql from "graphql-tag"
import {wuGeneral, wuTime} from "@yanikkendler/web-utils"
import {useApolloClient} from "@apollo/client"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialog"
import {useRouter} from "next/navigation"
import "./generalTab.scss"
import TextField from "@/components//inputs/textField/textField"
import Loader from "@/components/feedback/loader/loader"
import Separator from "@/components/separator/separator"
import {errorNotification, successNotification} from "@/service/NotificationService"
import Skeleton from "react-loading-skeleton"
import {DialogRef} from "@/components/dialog/dialog"
import {Archive, ArchiveRestore, Info, Trash, X} from "lucide-react"
import SimplePopover from "@/components/popover/simplePopover"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"

export default function GeneralTab({
    shotlist,
    setShotlist,
    dataChanged,
    isReadOnly,
    currentUser,
    shotlistOptionsDialogRef,
    isArchived,
    setIsArchived,
}: {
    shotlist: ShotlistDto | null,
    setShotlist: React.Dispatch<React.SetStateAction<ShotlistDto | null>>,
    dataChanged: () => void,
    isReadOnly: boolean,
    currentUser: UserDto | null,
    shotlistOptionsDialogRef: RefObject<DialogRef | null>,
    isArchived: boolean,
    setIsArchived: (isArchived: boolean) => void,

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

        setShotlist(current => ({
            ...current,
            name: data.updateShotlist.name
        }))

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

        successNotification({
            title: "Successfully deleted shotlist",
            message: `Returning to the dashboard`
        })
        router.push("/dashboard")
    }

    const toggleIsArchived = async () => {
        if(!shotlist) return

        const newState = !isArchived

        let decision = await confirm({
            title: 'Are you sure?',
            message: `Do you want to ${newState ? "archive" : "unarchive"} the shotlist "${shotlist.name}"? You can always ${newState ? "unarchive" : "archive"} it again later.`,
            buttons: {
                confirm: {
                    text: `${newState ? "Archive" : "Unarchive"} shotlist`,
                    className: 'bad'
                }
            }
        })

        if(!decision) return

        setIsArchived(newState)

        const { errors } = await client.mutate({
            mutation: gql`
                mutation archiveShotlist($id: String!, $isArchived: Boolean!) {
                    updateShotlistAsOwner(
                        editDTO: {
                            id: $id,
                            isArchived: $isArchived
                        }
                    ) {
                        id
                    }
                }
            `,
            variables: { id: shotlist.id, isArchived: newState },
        });

        if(errors) {
            errorNotification({
                title: "Failed update archived status",
                tryAgainLater: true
            })
            setIsArchived(!newState)
            console.error(errors)
        }
        else {
            successNotification({title: "Archival status updated", message: `This shotlist is ${newState ? "now archived" : "no longer archived"}.`})
        }
    }

    if(!shotlist || !currentUser) return (
        <div className={"shotlistOptionsDialogGeneralTab shotlistOptionsDialogPage"}>
            <div className="top">
                <h2>Shotlist settings</h2>
                <button className={"closeButton"} onClick={shotlistOptionsDialogRef.current?.close}>
                    <X size={18}/>
                </button>
            </div>
            <Skeleton height={"2.5rem"}/>

            <Separator/>

            <div className="details">
                <Skeleton count={4} height={"1.5rem"}/>
            </div>
        </div>
    )

    if(deleting) return <div className={"shotlistOptionsDialogGeneralTab shotlistOptionsDialogPage"}>
        <Loader text={"Deleting shotlist..."}/>
    </div>

    return (
        <div className={"shotlistOptionsDialogGeneralTab shotlistOptionsDialogPage"}>
            <div className="top">
                <h2>Shotlist settings</h2>
                <button className={"closeButton"} onClick={shotlistOptionsDialogRef.current?.close}>
                    <X size={18}/>
                </button>
            </div>
            <TextField
                label={"Name"}
                defaultValue={shotlist.name || ""}
                placeholder={"My shotlist"}
                valueChange={debounceUpdateShotlistName}
                disabled={isReadOnly}
            />

            <Separator/>

            <div className="details">
                <p>
                    Created at: <b>{wuTime.toDateTimeString(shotlist.createdAt)}</b>
                    {" by: "}
                    <SimpleTooltip text={shotlist.owner?.email || "Unknown email"}><b>{shotlist.owner?.name}</b></SimpleTooltip>
                </p>
                <p>Last edited at: <b>{wuTime.toDateTimeString(shotlist.editedAt) || "Unknown"}</b></p>
                <p><b>{shotlist.sceneCount}</b> scene{shotlist.sceneCount == 1 ? "" : "s"} • <b>{shotlist.shotCount}</b> shot{shotlist.shotCount == 1 ? "" : "s"}</p>
                {
                    shotlist.template ?
                    <p>Based on template: <b>{shotlist.template.name}</b></p> :
                    <p>Created without any template</p>
                }
                {
                    isArchived &&
                    <p className={"archiveNotice"}>This shotlist is: <b>Archived</b></p>
                }
            </div>

            {
                shotlist.owner?.id == currentUser?.id &&
                <div className={"bottom"}>
                    <div className="row">
                        <div className="left">
                            <p>{isArchived ? "Mark this shotlist as no longer archived" : "Mark this shotlist as archived and read-only"}</p>
                            <SimplePopover
                                content={
                                    <p>
                                        Archived shotlists can not be edited and are not displayed on the dashboard.
                                        <br/>
                                        You can change the archive status at any time.
                                        <br/>
                                        <br/>
                                        Shotlists can only be archived and unarchived by the shotlist owner (you).
                                    </p>
                                }
                                fontSize={0.85}
                                className={"noClickFx default round"}
                            >
                                <Info size={18}/>
                            </SimplePopover>
                        </div>
                        <button
                            className={`action ${isArchived ? "default" : "danger"}`}
                            onClick={toggleIsArchived}
                        >
                            {isArchived ?
                                <><ArchiveRestore size={18}/>Unarchive</> :
                                <><Archive size={18}/>Archive</>
                            }
                        </button>
                    </div>
                    <div className="row">
                        <p>Permanently delete the shotlist "{shotlist.name}"</p>
                        <button
                            className="action danger"
                            onClick={deleteShotlist}
                        >
                            <Trash size={18}/> Delete Shotlist
                        </button>
                    </div>
                </div>
            }
            {ConfirmDialog}
        </div>
    )
}