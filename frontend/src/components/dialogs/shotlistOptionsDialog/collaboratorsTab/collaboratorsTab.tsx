import React, {useState} from "react"
import {useApolloClient} from "@apollo/client"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialoge"
import "./collaboratorsTab.scss"
import {CollaborationDto, CollaborationState, CollaborationType} from "../../../../../lib/graphql/generated"
import TextField from "@/components//inputs/textField/textField"
import Skeleton from "react-loading-skeleton"
import gql from "graphql-tag"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import {Ellipsis, Send, Trash, User} from "lucide-react"
import SimpleSelect from "@/components/inputs/simpleSelect/simpleSelect"
import {Popover} from "radix-ui"
import GoogleLogo from "@/components/googleLogo"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"
import Config from "@/util/Config"
import HelpLink from "@/components/helpLink/helpLink"
import {errorNotification} from "@/service/NotificationService"

export default function CollaboratorsTab(
    {
        shotlistId,
        collaborations,
        setCollaborations
    }:{
        shotlistId: string | null,
        collaborations: CollaborationDto[] | null,
        setCollaborations: (collaborators: CollaborationDto[]) => void
    }
) {
    const client = useApolloClient()
    const { confirm, ConfirmDialog } = useConfirmDialog()

    const [inputValue, setInputValue] = useState("")
    const [emailInvalid, setEmailInvalid] = useState<boolean>(false)

    const addCollaborator = async () => {
        if(!wuConstants.Regex.email.test(inputValue)) return

        try{
            const result = await client.mutate({
                mutation: gql`
                    mutation addCollaboration($shotlistId: String!, $email: String!) {
                        addCollaboration(createDTO: {
                            shotlistId: $shotlistId,
                            email: $email
                        }) {
                            id
                            user {
                                id
                                email
                                name
                                auth0Sub
                            }
                            collaborationType
                            collaborationState
                        }
                    }
                `,
                variables: {shotlistId: shotlistId, email: inputValue},
            })
            if (result.errors) {
                errorNotification({
                    title: "Could not add this email as a collaborator",
                    sub: "Please try a different email"
                })
                setEmailInvalid(true)
                console.error(result.errors);
                return;
            }

            setCollaborations([
                ...collaborations || [],
                ...result.data.addCollaboration
            ])

            setInputValue("")
        }
        catch (e) {
            setEmailInvalid(true)
            console.error(e);
        }
    }

    const updateCollaborationType = async (collaborationId: string, newType: CollaborationType) => {
        const result = await client.mutate({
            mutation: gql`
                mutation updateCollaboration($collaborationId: String!, $collaborationType: CollaborationType!) {
                    editCollaboration(editDTO: {
                        id: $collaborationId,
                        collaborationType: $collaborationType
                    }) {
                        id
                        collaborationType
                    }
                }
            `,
            variables: {collaborationId, collaborationType: newType},
        })
        if (result.errors) {
            errorNotification({
                title: "Failed to update collaboration type",
                tryAgainLater: true
            })
            console.error(result.errors);
            return;
        }

        let newCollaborations: CollaborationDto[] = (collaborations || []).map((collab) => {
            if(collab.id == collaborationId) {
                return {
                    ...collab,
                    collaborationType: newType
                }
            }
            return collab
        })

        setCollaborations(newCollaborations)
    }

    const deleteCollaboration = async (collaborationId: string) => {
        let decision = await confirm({
            title: 'Remove collaborator?',
            message: `This will revoke all access to this shotlist for "${collaborations?.find(collab => collab.id === collaborationId)?.user?.name}".`,
            buttons: {
                confirm: {
                    text: 'Remove Collaborator',
                    className: 'bad'
                }
            }
        })

        if(!decision) return

        const result = await client.mutate({
            mutation: gql`
                mutation deleteCollaboration($collaborationId: String!) {
                    deleteCollaboration(id: $collaborationId) {
                        id
                    }
                }
            `,
            variables: {collaborationId},
        })
        if (result.errors) {
            errorNotification({
                title: "Failed to remove collaborator",
                tryAgainLater: true
            })
            console.error(result.errors);
            return;
        }

        setCollaborations(
            (collaborations || []).filter((collab) => collab.id !== collaborationId)
        )
    }

    const refreshCollaboration = async (collaborationId: string) => {
        const result = await client.mutate({
            mutation: gql`
                mutation refreshCollaboration($collaborationId: String!) {
                    refreshCollaboration(id: $collaborationId) {
                        id
                    }
                }
            `,
            variables: {collaborationId},
        })
        if (result.errors) {
            errorNotification({
                title: "Failed to resend Collaboration",
                tryAgainLater: true
            })
            console.error(result.errors);
            return;
        }

        let newCollaborations: CollaborationDto[] = (collaborations || []).map((collab) => {
            if(collab.id == collaborationId) {
                return {
                    ...collab,
                    collaborationState: CollaborationState.Pending
                }
            }
            return collab
        })

        setCollaborations(newCollaborations)
    }

    if(collaborations == null) {
        return <>
            <h2></h2>
            <Skeleton height={"2rem"} style={{marginTop: ".5rem"}} count={2}/>
            <Skeleton height={"2rem"} width={"15ch"} style={{marginTop: "2rem"}}/>
        </>
    }

    return (
        <div className={"shotlistOptionsDialogCollaboratorsTab"}>
            <h2>Current Collaborators</h2>
            <div className="collaborators">
            {
                collaborations.length <= 0 ?
                    <p className={"empty"}>No collaborators yet</p> :
                collaborations?.map((collab) => (
                    <div className={"collaborator"} key={collab.id}>
                        <User size={26}/>
                        <p><span className={"bold"}>{collab.user?.name}</span> • {collab.user?.email}</p>
                        {collab.user?.auth0Sub?.startsWith("google-oauth2|") && <SimpleTooltip asButton={true} text="Signed up using Google"><GoogleLogo/></SimpleTooltip>}
                        <div className="inlineButtons">
                            {collab.collaborationState == CollaborationState.Declined && (
                                <SimpleTooltip
                                    text="This invitation was declined. Click to resend."
                                    showHoverArea={false}
                                    delay={100}
                                >
                                    <button
                                        className={"default"}
                                        onClick={() => refreshCollaboration(collab.id || "")}
                                    >
                                        <Send size={18}/>
                                    </button>
                                </SimpleTooltip>
                            )}
                            <SimpleSelect
                                name={"role"}
                                onChange={(newValue) => updateCollaborationType(collab.id || "", newValue as CollaborationType)}
                                value={collab.collaborationType as CollaborationType}
                                options={[
                                    {label: "Viewer", value: CollaborationType.View},
                                    {label: "Editor", value: CollaborationType.Edit},
                                ]}
                                fontSize={".95rem"}
                            />
                            <button
                                className="delete bad"
                                onClick={() => deleteCollaboration(collab.id || "")}
                            >
                                <Trash size={18}/>
                            </button>
                        </div>
                        <Popover.Root>
                            <Popover.Trigger className={"optionsTrigger"}><Ellipsis size={18}/></Popover.Trigger>
                            <Popover.Portal>
                                <Popover.Content className="popoverContent collaboratorOptionsPopup" sideOffset={5} align={"start"}>
                                    <SimpleSelect
                                        name={"role"}
                                        onChange={(newValue) => updateCollaborationType(collab.id || "", newValue as CollaborationType)}
                                        value={collab.collaborationType as CollaborationType}
                                        options={[
                                            {label: "Viewer", value: CollaborationType.View},
                                            {label: "Editor", value: CollaborationType.Edit},
                                        ]}
                                    />
                                    <button
                                        onClick={() => deleteCollaboration(collab.id || "")}
                                    >
                                        Remove <Trash size={18}/>
                                    </button>
                                    {collab.collaborationState == CollaborationState.Declined && (
                                        <button
                                            onClick={() => refreshCollaboration(collab.id || "")}
                                        >
                                            Resend invitation <Send size={18}/>
                                        </button>
                                    )}
                                </Popover.Content>
                            </Popover.Portal>
                        </Popover.Root>
                    </div>
                )
            )}
            </div>

            <div className="new">
                {
                    collaborations && collaborations?.length >= Config.constant.maxCollaboratorsInFreePlan ?
                    <p className="error">Sorry, users in basic tier can only have {Config.constant.maxCollaboratorsInFreePlan} collaborators.</p> :
                    <>
                        <TextField
                            label={"email"}
                            placeholder={"yourfriend@email.com"}
                            valueChange={value => {
                                setInputValue(value)
                                setEmailInvalid(false)
                            }}
                            value={inputValue}
                            autoComplete={false}
                        />
                        <button
                            className={"accent"}
                            disabled={!wuConstants.Regex.email.test(inputValue)}
                            onClick={addCollaborator}
                        >
                            Invite
                        </button>
                    </>
                }
            </div>
            {
                emailInvalid &&
                <p className={"invalid"}>No Shotly account is associated with that email.</p>
            }

            <HelpLink link="https://docs.shotly.at/shotlist/collaboration" floating/>

            {ConfirmDialog}
        </div>
    )
}