import {forwardRef, useEffect, useImperativeHandle, useState} from "react"
import auth from "@/Auth"
import {CollaborationDto, CollaborationState, Query} from "../../../../../../lib/graphql/generated"
import Utils from "@/utility/Utils"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import {errorNotification, successNotification} from "@/service/NotificationService"
import {Check, Inbox, RefreshCw, X} from "lucide-react"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import Skeleton from "react-loading-skeleton"
import { Popover } from "radix-ui"

export interface CollaborationRequestsPopupRef {
    toggleCollaborationRequests: () => void
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

    const [collaborationRequestOpen, setCollaborationRequestOpen] = useState(false)
    const [collaborationReloadAllowed, setCollaborationReloadAllowed] = useState<boolean>(true)

    const [pendingCollaborations, setPendingCollaborations] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    useEffect(() => {
        if(!auth.getUser()) return

        loadPendingCollaborations()
    }, [])

    useImperativeHandle(ref, () => ({
        toggleCollaborationRequests: toggleCollaborationRequests
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
                            name
                            email
                        }
                        shotlist {
                            name
                        }
                        collaborationState
                        collaborationType
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

    return (
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
                    {
                        pendingCollaborations.loading ? <>
                                <Skeleton height={"2rem"}/>
                            </> :
                            pendingCollaborations.data.pendingCollaborations && pendingCollaborations.data.pendingCollaborations.length <= 0 ?
                                <p className={"empty"}>No open collaboration requests</p> :
                                (pendingCollaborations.data.pendingCollaborations as CollaborationDto[])?.map((collab) => (
                                    <div key={collab.id} className={"collaborationRequest"}>
                                        <p>
                                            <SimpleTooltip text={collab.owner?.email || "Unknown email"}><span className={"bold"}>{collab.owner?.name}</span></SimpleTooltip>
                                            {" has invited you to the shotlist "}
                                            <span className={"bold"}>{collab.shotlist?.name || "Unnamed"}</span>
                                        </p>
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
                                    </div>
                                ))
                    }

                    <button
                        className={"reload"}
                        onClick={() => loadPendingCollaborations(true)}
                        disabled={!collaborationReloadAllowed}
                    >
                        <RefreshCw size={16}/>
                        {
                            collaborationReloadAllowed ?
                                "refresh" :
                                "please wait a few seconds..."
                        }
                    </button>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
})

export default CollaborationRequestsPopup