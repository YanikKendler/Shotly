import {forwardRef, useEffect, useImperativeHandle, useState} from "react"
import auth from "@/Auth"
import {CollaborationDto, CollaborationState, Query} from "../../../../../../lib/graphql/generated"
import Utils from "@/utility/Utils"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import {errorNotification, successNotification} from "@/service/NotificationService"
import {Ban, Check, Inbox, RefreshCw, X} from "lucide-react"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import Skeleton from "react-loading-skeleton"
import { Popover } from "radix-ui"
import "./collaborationRequestsPopup.scss"
import {useConfirmDialog} from "@/components/app/dialogs/confirmDialog/confirmDialog"

export interface CollaborationRequestsPopupRef {
    toggleCollaborationRequests: () => void
    setCollaborationRequestsOpen: (isOpen: boolean) => void
}

export interface CollaborationRequestsPopupProps {
    reloadShotlists: () => void
}

const CollaborationRequestsPopup = forwardRef<
    CollaborationRequestsPopupRef,
    CollaborationRequestsPopupProps
>(({
    reloadShotlists
}, ref) => {
    const client = useApolloClient()
    const {confirm, ConfirmDialog} = useConfirmDialog()

    const [collaborationRequestOpen, setCollaborationRequestOpen] = useState(false)
    const [collaborationReloadAllowed, setCollaborationReloadAllowed] = useState<boolean>(true)

    const [pendingCollaborations, setPendingCollaborations] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    useEffect(() => {
        if(!auth.getUser()) return

        loadPendingCollaborations()
    }, [])

    useImperativeHandle(ref, () => ({
        toggleCollaborationRequests: toggleCollaborationRequests,
        setCollaborationRequestsOpen: setCollaborationRequestOpen
    }))

    const toggleCollaborationRequests = () => {
        setCollaborationRequestOpen(current => !current)
    }

    const loadPendingCollaborations = async (showNotification = false) => {
        setCollaborationReloadAllowed(false)
        setPendingCollaborations(current => ({
            ...current,
            loading: true
        }))

        const result = await client.query({
            query: gql`
                query pendingCollaborations{
                    pendingCollaborations{
                        id
                        owner {
                            id
                            name
                            email
                        }
                        shotlist {
                            name
                        }
                        collaborationState
                    }
                }`,
            fetchPolicy: "no-cache"
        })

        setTimeout(()=> {
            setCollaborationReloadAllowed(true)
        }, wuConstants.Time.msPerSecond * 5)


        if(result.errors) {
            errorNotification({
                title: "Failed to load collaboration requests",
                tryAgainLater: true
            })
            console.error(result.errors)
            return
        }

        setPendingCollaborations(result)

        if(showNotification)
            successNotification({
                title: "Refreshed collaborations",
            })
    }

    const acceptOrDeclineCollaboration = async (collaborationId: string, newState: CollaborationState) => {
        const result = await client.mutate({
            mutation: gql`
                mutation acceptOrDeclineCollaboration($collaborationId: String!, $newState: CollaborationState!) {
                    acceptOrDeclineCollaboration(editDTO: {
                        id: $collaborationId,
                        collaborationState: $newState
                    }) {
                        id
                        user {
                            id
                            email
                            name
                        }
                        collaborationType
                        collaborationState
                    }
                }
            `,
            variables: {collaborationId: collaborationId, newState: newState},
        })
        if (result.errors) {
            errorNotification({
                title: `Failed to ${newState} collaboration`,
                tryAgainLater: true
            })
            console.error(result.errors);
            return;
        }

        if(newState == CollaborationState.Accepted) {
            reloadShotlists()
        }

        setPendingCollaborations(current => {
            let newCollaborations = current.data.pendingCollaborations?.filter(c => c?.id !== collaborationId) || []

            return {
                ...current,
                data: {
                    ...current.data,
                    pendingCollaborations: newCollaborations
                }
            }
        })
    }

    const blockUser = async (collab: CollaborationDto)=> {
        const decision = await confirm({
            title: `Block user "${collab.owner?.name}"?`,
            richMessage: <>
                The user "{collab.owner?.name}" will no longer be able to invite you to any of their shotlists.
                <br/>
                Their access to any of your shotlists as well as your access to their shotlists will be removed.
                <br/>
                <br/>
                <span className={"gray small"}>You can manage blocked users via the account dialog.</span>
            </>,
            buttons: {
                confirm: {
                    className: "bad"
                }
            }
        })

        if(!decision) return

        const result = await client.mutate({
            mutation: gql`
                mutation blockUser($userId: String!) {
                    updateUserBlocking(blockDTO: {
                        userId: $userId,
                        isBlocked: true
                    }) {
                        id
                    }
                }
            `,
            variables: {userId: collab.owner?.id},
        })
        if (result.errors) {
            errorNotification({
                title: `Failed to block user`,
                tryAgainLater: true
            })
            console.error(result.errors);
            return;
        }

        successNotification({
            title: "User blocked successfully",
            message: `"${collab.owner?.name}" can no longer send you collaboration invites`
        })

        reloadShotlists()

        setPendingCollaborations(current => {
            let newCollaborations = current.data.pendingCollaborations
                ?.filter(c => c?.owner?.id != collab.owner?.id) || []

            return {
                ...current,
                data: {
                    ...current.data,
                    pendingCollaborations: newCollaborations
                }
            }
        })
    }

    return (
        <>
        <Popover.Root open={collaborationRequestOpen} onOpenChange={setCollaborationRequestOpen}>
            <SimpleTooltip
                content={<p><span className="key">Alt</span> + <span className="key">C</span></p>}
            >
                <Popover.Trigger className={"collaborationRequestsTrigger"}>
                    Collaborations
                    <Inbox size={18}/>
                    {
                        pendingCollaborations.data.pendingCollaborations && pendingCollaborations.data.pendingCollaborations.length > 0 &&
                        <span className={"badge"}>{pendingCollaborations.data.pendingCollaborations.length}</span>
                    }
                </Popover.Trigger>
            </SimpleTooltip>
            <Popover.Portal>
                <Popover.Content
                    className={"popoverContent CollaborationRequests"}
                    side={"top"}
                    align={"start"}
                    onOpenAutoFocus={e => e.preventDefault()}
                >
                    <div className="top">
                        <h2>Collaboration requests</h2>
                        <SimpleTooltip
                            text={ collaborationReloadAllowed ?
                                "refresh" :
                                "please wait a few seconds..."
                            }
                        >
                            <button
                                className={"reload"}
                                onClick={() => loadPendingCollaborations(true)}
                                disabled={!collaborationReloadAllowed}
                            >
                                <RefreshCw size={16}/>
                            </button>
                        </SimpleTooltip>
                    </div>
                    <div className={"content"}>
                        {
                            pendingCollaborations.loading ?
                                <>
                                    <Skeleton height={"2rem"}/>
                                    <Skeleton height={"2rem"}/>
                                </>
                                :
                            !pendingCollaborations.data.pendingCollaborations || pendingCollaborations.data.pendingCollaborations.length <= 0 ?
                                <p className={"empty"}>No open collaboration requests</p>
                                :
                            (pendingCollaborations.data.pendingCollaborations as CollaborationDto[])?.map((collab) => (
                                <div key={collab.id} className={"collaborationRequest"}>
                                    <p>
                                        <SimpleTooltip text={collab.owner?.email || "Unknown email"}>
                                            <span className={"bold"}>{collab.owner?.name}</span>
                                        </SimpleTooltip>
                                        {" has invited you to the shotlist "}
                                        <span className={"bold"}>{collab.shotlist?.name || "Unnamed"}</span>
                                    </p>
                                    <div className="buttons">
                                        <SimpleTooltip text="Accept collaboration">
                                            <button
                                                className={"accent"}
                                                onClick={() => acceptOrDeclineCollaboration(collab.id || "", CollaborationState.Accepted)}
                                            >
                                                <Check size={16} strokeWidth={2.5}/>
                                            </button>
                                        </SimpleTooltip>
                                        <SimpleTooltip text="Decline collaboration">
                                            <button
                                                className={"accent"}
                                                onClick={() => acceptOrDeclineCollaboration(collab.id || "", CollaborationState.Declined)}
                                            >
                                                <X size={16} strokeWidth={2.5}/>
                                            </button>
                                        </SimpleTooltip>
                                        <SimpleTooltip text="Block this user">
                                            <button
                                                className={"accent"}
                                                onClick={() => blockUser(collab)}
                                            >
                                                <Ban size={15} strokeWidth={2.5}/>
                                            </button>
                                        </SimpleTooltip>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    {ConfirmDialog}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
        </>
    )
})

export default CollaborationRequestsPopup