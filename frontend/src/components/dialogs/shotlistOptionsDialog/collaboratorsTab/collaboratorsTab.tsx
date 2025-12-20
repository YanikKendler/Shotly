import React, {useState} from "react"
import {useApolloClient} from "@apollo/client"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialoge"
import "./collaboratorsTab.scss"
import {
    CollaborationDto,
    CollaborationType,
    SceneAttributeType,
    ShotAttributeType
} from "../../../../../lib/graphql/generated"
import Input from "@/components/inputs/input/input"
import Skeleton from "react-loading-skeleton"
import gql from "graphql-tag"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import {ChevronDown, Ellipsis, EllipsisVertical, List, Plus, Trash, Type, User} from "lucide-react"
import SimpleSelect from "@/components/inputs/simpleSelect/simpleSelect"
import {Popover, Separator} from "radix-ui"

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

    const addCollaborator = async () => {
        if(!wuConstants.Regex.email.test(inputValue)) return

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
                        }
                        collaborationType
                        collaborationState
                    }
                }
            `,
            variables: {shotlistId: shotlistId, email: inputValue},
        })
        if (result.errors) {
            //TODO notify user
            console.error(result.errors);
            return;
        }

        setCollaborations([
            ...collaborations || [],
            result.data.addCollaboration
        ])

        setInputValue("")
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
            //TODO notify user
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
            //TODO notify user
            console.error(result.errors);
            return;
        }

        setCollaborations(
            (collaborations || []).filter((collab) => collab.id !== collaborationId)
        )
    }

    return (
        <div className={"shotlistOptionsDialogCollaboratorsTab"}>
            <h2>Current Collaborators</h2>
            {
                collaborations == null ?
                    <Skeleton height={"2rem"} width={"80%"} count={2}/> :
                collaborations.length <= 0 ?
                    <p className={"empty"}>No collaborators yet</p> :
                collaborations?.map((collab) => (
                    <div className={"collaborator"} key={collab.id}>
                        <User size={30}/>
                        <p><span className={"bold"}>{collab.user?.name}</span> • {collab.user?.email}</p>
                        <div className="inlineButtons">
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
                                className="delete bad"
                                onClick={() => deleteCollaboration(collab.id || "")}
                            >
                                <Trash size={18}/>
                            </button>
                        </div>
                        <Popover.Root>
                            <Popover.Trigger className={"optionsTrigger"}><Ellipsis size={18}/></Popover.Trigger>
                            <Popover.Portal>
                                <Popover.Content className="PopoverContent collaboratorOptionsPopup" sideOffset={5} align={"start"}>
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
                                        className="delet"
                                        onClick={() => deleteCollaboration(collab.id || "")}
                                    >
                                        Remove <Trash size={18}/>
                                    </button>
                                </Popover.Content>
                            </Popover.Portal>
                        </Popover.Root>
                    </div>
                )
            )}

            <Separator.Root className="Separator horizontal" orientation="horizontal"/>

            <div className="new">
                <Input
                    label={"email"}
                    placeholder={"yourfriend@email.com"}
                    valueChange={setInputValue}
                    value={inputValue}
                />
                <button
                    className={"accent"}
                    disabled={!wuConstants.Regex.email.test(inputValue)}
                    onClick={addCollaborator}
                >
                    Invite
                </button>
            </div>

            {ConfirmDialog}
        </div>
    )
}