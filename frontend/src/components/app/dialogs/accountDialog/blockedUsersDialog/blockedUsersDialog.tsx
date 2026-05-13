import {Check, UserRoundPen, X} from "lucide-react"
import Dialog, {DialogRef} from "@/components/basic/dialog/dialog"
import React, {Dispatch, SetStateAction, useRef} from "react"
import "./blockedUsersDialog.scss"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {Maybe, Query, UserMinimalDto} from "../../../../../../lib/graphql/generated"
import Skeleton from "react-loading-skeleton"
import Link from "next/link"
import {useConfirmDialog} from "@/components/app/dialogs/confirmDialog/confirmDialog"
import {errorNotification, successNotification} from "@/service/NotificationService"
import gql from "graphql-tag"

export default function BlockedUsersDialog({
    query,
    setQuery
}:{
    query: ApolloQueryResult<Query>,
    setQuery: Dispatch<SetStateAction<ApolloQueryResult<Query>>>
}) {
    const {confirm, ConfirmDialog} = useConfirmDialog()
    const client = useApolloClient()

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

        setQuery(current => {
            let newBlockedUsers = current.data.currentUser?.blockedUsers
                ?.filter(b => b?.id !== user.id)

            return {
                ...current,
                data: {
                    ...current.data,
                    currentUser: {
                        ...current.data.currentUser,
                        blockedUsers: newBlockedUsers
                    }
                }
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
                    query.loading ?
                    <>
                        <Skeleton height={"2rem"}/>
                        <Skeleton height={"2rem"}/>
                    </>
                    :
                    (query.data?.currentUser?.blockedUsers?.length ?? 0) == 0 ?
                    <p className="empty">You have not blocked any users.</p>
                    :
                    query.data.currentUser?.blockedUsers?.map(blockedUser => (
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
                    <Link className={"inline"} href={"https://docs.shotly.at/account#blocked-users"}>Read more..</Link>
                </p>
            </Dialog>

            {ConfirmDialog}
        </>
    )
}