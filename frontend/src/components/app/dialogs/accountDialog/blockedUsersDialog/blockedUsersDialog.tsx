import {Check, UserRoundPen, X} from "lucide-react"
import Dialog, {DialogRef} from "@/components/basic/dialog/dialog"
import React, {Dispatch, SetStateAction, useContext, useRef} from "react"
import "./blockedUsersDialog.scss"
import {useApolloClient} from "@apollo/client"
import {Maybe, Query, UserMinimalDto} from "../../../../../../lib/graphql/generated"
import Skeleton from "react-loading-skeleton"
import Link from "next/link"
import {useConfirmDialog} from "@/components/app/dialogs/confirmDialog/confirmDialog"
import {errorNotification, successNotification} from "@/service/NotificationService"
import gql from "graphql-tag"
import {AppContext} from "@/context/AppContext"

export default function BlockedUsersDialog() {
    const {confirm, ConfirmDialog} = useConfirmDialog()
    const client = useApolloClient()
    const appContext = useContext(AppContext)

    const dialogRef = useRef<DialogRef>(null)

    const unblockUser = async (user: Maybe<UserMinimalDto>) => {
        if(!user){
            errorNotification({
                message: "Could not find user.",
                tryAgainLater: true
            })
            return
        }

        const decision = await confirm({
            title: "Unblock User?",
            message: `The user "${user.name}" will be able to invite you to their shotlists again.`
        })

        if(!decision) return

        const result = await client.mutate({
            mutation: gql`
                mutation unblockUser($userId: String!) {
                    updateUserBlocking(blockDTO: {
                        userId: $userId,
                        isBlocked: false
                    }) {
                        id
                    }
                }
            `,
            variables: {userId: user.id},
        })
        if (result.errors) {
            errorNotification({
                title: `Failed to unblock user`,
                tryAgainLater: true
            })
            console.error(result.errors);
            return;
        }

        successNotification({
            title: "User unblocked successfully",
            message: `"${user.name}" can now send you collaboration invites again.`
        })

        appContext.setCurrentUser(current => {
            let newBlockedUsers = current?.blockedUsers
                ?.filter(b => b?.id !== user.id)

            return {
                ...current,
                blockedUsers: newBlockedUsers
            }
        })
    }

    return (
        <>
            <button
                onClick={() => dialogRef.current?.open()}
            >
                <UserRoundPen size={16}/>Manage
            </button>
            <Dialog contentClassName={"blockedUsersDialogContent"} ref={dialogRef}>
                <div className="top sticky">
                    <h2 className={"title"}>Blocked Users</h2>
                    <button className={"close default"} onClick={dialogRef.current?.close}>
                        <X size={18}/>
                    </button>
                </div>
                {
                    appContext.currentUserReloading ?
                    <>
                        <Skeleton height={"2rem"}/>
                        <Skeleton height={"2rem"}/>
                    </>
                    :
                    (appContext.currentUser?.blockedUsers?.length ?? 0) == 0 ?
                    <p className="empty">You have not blocked any users.</p>
                    :
                    appContext.currentUser?.blockedUsers?.map(blockedUser => (
                        <div className={"entry"} key={blockedUser?.id}>
                            <p>{blockedUser?.name ?? "Unknown"} • <span className={"gray"}>{blockedUser?.email ?? "Unknown"}</span></p>
                            <button
                                className={"default"}
                                onClick={() => unblockUser(blockedUser)}
                            >
                                Unblock <Check size={18}/>
                            </button>
                        </div>
                    ))
                }
                <p className="bottom">
                    Blocked users are unable to invite you to their shotlists but you might still see their edits.
                    <Link className={"inline"} href={"https://docs.shotly.at/account#blocked-users"} target={"_blank"}>Read more..</Link>
                </p>
            </Dialog>

            {ConfirmDialog}
        </>
    )
}