import React, {useState} from "react"
import {useApolloClient} from "@apollo/client"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialoge"
import {useRouter} from "next/navigation"
import "./collaboratorsTab.scss"
import {CollaborationDto, ShotAttributeType} from "../../../../../lib/graphql/generated"
import Input from "@/components/inputs/input/input"
import Skeleton from "react-loading-skeleton"
import gql from "graphql-tag"
import {wuConstants} from "@yanikkendler/web-utils/dist"

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
                        collaboratorRole
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
    }

    return (
        <div className={"shotlistOptionsDialogCollaboratorsTab"}>
            {
                collaborations == null ?
                    <Skeleton height={"2rem"} width={"80%"} count={2}/> :
                collaborations.length <= 0 ?
                    <p className={"empty"}>no Collaborators yet</p> :
                collaborations?.map((collab) => (
                    <div key={collab.id}>
                        <p><span className={"bold"}>{collab.user?.name}</span> • {collab.user?.email}</p>
                    </div>
                )
            )}

            <div className="new">
                <Input
                    label={"email"}
                    placeholder={"yourfriend@email.com"}
                    valueChange={setInputValue}
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