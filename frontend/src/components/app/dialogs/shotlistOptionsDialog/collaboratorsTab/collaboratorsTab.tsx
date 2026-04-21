import React, {RefObject, useEffect, useState} from "react"
import {useApolloClient} from "@apollo/client"
import {useConfirmDialog} from "@/components/app/dialogs/confirmDialog/confirmDialog"
import "./collaboratorsTab.scss"
import {
    CollaborationDto,
    CollaborationState,
    CollaborationType,
    ShotlistDto
} from "../../../../../../lib/graphql/generated"
import TextField from "@/components/basic/textField/textField"
import Skeleton from "react-loading-skeleton"
import gql from "graphql-tag"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import {Ellipsis, Send, Trash, User, X} from "lucide-react"
import SimpleSelect from "@/components/basic/simpleSelect/simpleSelect"
import {Popover} from "radix-ui"
import GoogleLogo from "@/components/logo/googleLogo"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"
import Config from "@/Config"
import HelpLink from "@/components/app/helpLink/helpLink"
import {errorNotification, successNotification} from "@/service/NotificationService"
import {DialogRef} from "@/components/basic/dialog/dialog"
import auth from "@/Auth"
import {ShotlyErrorCode} from "@/utility/Types"
import {ShotlistOptionsDialogPage} from "@/components/app/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import {useRouter} from "next/navigation"

export default function CollaboratorsTab(
    {
        shotlist,
        collaborations,
        setCollaborations,
        shotlistOptionsDialogRef,
        isAvailable
    }:{
        shotlist: ShotlistDto | null
        collaborations: CollaborationDto[] | null
        setCollaborations: React.Dispatch<React.SetStateAction<CollaborationDto[] | null>>
        shotlistOptionsDialogRef: RefObject<DialogRef | null>
        isAvailable: boolean
    }
) {
    const client = useApolloClient()
    const { confirm, ConfirmDialog } = useConfirmDialog()
    const router = useRouter()

    const [inputValue, setInputValue] = useState("")
    const [userIsAlreadyAMember, setUserIsAlreadyAMember] = useState(false)
    const [emailInvalid, setEmailInvalid] = useState<boolean>(false)

    useEffect(() => {
        const isAlreadyACollaborator = collaborations?.some(c => c.user?.email == inputValue) || false
        const isOwner = auth.getUser()?.email == inputValue
        setUserIsAlreadyAMember(isAlreadyACollaborator || isOwner)
    }, [inputValue]);

    const addCollaborator = async () => {
        if(!wuConstants.Regex.email.test(inputValue)) return

        if(userIsAlreadyAMember) return

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
                variables: {shotlistId: shotlist?.id, email: inputValue},
            })
            if (result.errors) {
                if(result.errors[0]?.extensions?.code as ShotlyErrorCode != ShotlyErrorCode.TOO_MANY_REQUESTS) {
                    errorNotification({
                        title: "Could not add this email as a collaborator",
                        sub: "Please try a different email"
                    })
                    setEmailInvalid(true)
                }
                console.error(result.errors);
                return;
            }

            setCollaborations(current => [
                ...(current || []),
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

        setCollaborations(current => {
            if(!current) return current

            return current.map((collab) => {
                if(collab.id == collaborationId) {
                    return {
                        ...collab,
                        collaborationType: newType
                    }
                }
                return collab
            })
        })
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

        setCollaborations(current => current ? current.filter((collab) => collab.id !== collaborationId) : current)
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
                title: "Failed to resend collaboration",
                tryAgainLater: true
            })
            console.error(result.errors);
            return;
        }

        setCollaborations(current => {
            if(!current) return current

            return current.map((collab) => {
                if(collab.id == collaborationId) {
                    return {
                        ...collab,
                        collaborationState: CollaborationState.Pending
                    }
                }
                return collab
            })
        })
    }

    const leaveCollaboration = async () => {
        if(!shotlist?.id) return

        let decision = await confirm({
            title: "Are you sure?",
            message: `You will loose access to the Shotlist "${shotlist?.name || "Unnamed"}" until its owner invites you again."`,
            buttons: {
                confirm: {
                    className: "bad",
                }
            }
        })

        if(!decision) return

        const result = await client.mutate({
            mutation: gql`
                mutation leaveCollaboration($shotlistId: String!){
                    leaveCollaboration(shotlistId: $shotlistId){
                        id
                    }
                }`,
            variables: {shotlistId: shotlist.id}
        })

        if(result.errors){
            errorNotification({
                title: "Failed to leave collaboration",
                tryAgainLater: true
            })
            console.error("Error leaving collaboration:", result.errors)
            return
        }

        router.push("/dashboard")
    }

    if(!isAvailable) {
        return <div className="shotlistOptionsDialogCollaboratorsTab shotlistOptionsDialogPage">
            <div className="top">
                <h2>Collaboration</h2>
                <button className={"closeButton"} onClick={shotlistOptionsDialogRef.current?.close}>
                    <X size={18}/>
                </button>
            </div>
            <div className="leave">
                <p>Leave this Shotlist</p>
                <button
                    className="bad"
                    onClick={leaveCollaboration}
                >
                    Leave
                </button>
            </div>
            <p className={"empty"}>As a collaborator, you don’t have permission to edit collaborators.</p>
        </div>
    }

    if(collaborations == null) {
        return <div className="shotlistOptionsDialogCollaboratorsTab shotlistOptionsDialogPage">
            <div className="top">
                <h2>Current Collaborators</h2>
                <button className={"closeButton"} onClick={shotlistOptionsDialogRef.current?.close}>
                    <X size={18}/>
                </button>
            </div>
            <Skeleton height={"2rem"} style={{marginTop: ".5rem"}} count={2}/>
            <Skeleton height={"2rem"} width={"15ch"} style={{marginTop: "2rem"}}/>
        </div>
    }

    return (
        <div className={"shotlistOptionsDialogCollaboratorsTab shotlistOptionsDialogPage"}>
            <div className="top">
                <h2>Current Collaborators</h2>
                <button className={"closeButton"} onClick={shotlistOptionsDialogRef.current?.close}>
                    <X size={18}/>
                </button>
            </div>
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
                            disabled={
                                !wuConstants.Regex.email.test(inputValue) ||
                                userIsAlreadyAMember
                            }
                            onClick={addCollaborator}
                        >
                            Invite <Send size={16} strokeWidth={2.5}/>
                        </button>
                    </>
                }
            </div>
            {
                userIsAlreadyAMember &&
                <p className={"invalid"}>This user is already a collaborator on this shotlist</p>

            }
            {
                emailInvalid &&
                <p className={"invalid"}>No Shotly account is associated with this email.</p>
            }

            <HelpLink link="https://docs.shotly.at/shotlist/collaboration" name={"Collaboration"} floating/>

            {ConfirmDialog}
        </div>
    )
}