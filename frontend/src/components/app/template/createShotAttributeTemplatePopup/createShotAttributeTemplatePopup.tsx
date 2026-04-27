import Skeleton from "react-loading-skeleton"
import {Dispatch, SetStateAction, useRef} from "react"
import {Query, ShotAttributeType} from "../../../../../lib/graphql/generated"
import {ChevronDown, List, Plus, Type} from "lucide-react"
import SimplePopover, {SimplePopoverRef} from "@/components/basic/popover/simplePopover"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {errorNotification} from "@/service/NotificationService"

export default function CreateShotAttributeTemplatePopup({
    setQuery,
    templateId,
    isLoading
}:{
    setQuery: Dispatch<SetStateAction<ApolloQueryResult<Query>>>
    templateId: string
    isLoading: boolean
}){
    const client = useApolloClient()

    const popoverRef = useRef<SimplePopoverRef>(null);

    async function createShotAttributeTemplate(type: ShotAttributeType) {
        popoverRef.current?.close()

        const {data, errors} = await client.mutate({
            mutation: gql`
                mutation createShotAttributeTemplate($templateId: String!, $attributeType: ShotAttributeType!) {
                    createShotAttributeTemplate(createDTO: {templateId: $templateId, type: $attributeType}) {
                        id
                        name
                        position
                        type
                    }
                }
            `,
            variables: {templateId: templateId, attributeType: type},
        });
        if (errors) {
            errorNotification({
                title: "Failed to create shot attribute definition",
                tryAgainLater: true
            })
            console.error(errors);
            return;
        }

        setQuery(current => ({
            ...current,
            data: {
                ...current.data,
                template:{
                    ...current.data.template,
                    shotAttributes: [
                        ...(current.data.template?.shotAttributes || []),
                        data.createShotAttributeTemplate
                    ]
                }
            }
        }))
    }

    if(isLoading) return <Skeleton height="2rem" count={2}/>

    return (
        <SimplePopover
            ref={popoverRef}
            className={"add"}
            contentClassName={"addAttributeTemplatePopup"}
            showArrow={false}
            side={"bottom"}
            align={"start"}
            content={<>
                <button onClick={() => createShotAttributeTemplate(ShotAttributeType.ShotTextAttribute)}><Type
                    size={16} strokeWidth={3}/>Text
                </button>
                <button
                    onClick={() => createShotAttributeTemplate(ShotAttributeType.ShotSingleSelectAttribute)}>
                    <ChevronDown size={16} strokeWidth={3}/>Single select
                </button>
                <button
                    onClick={() => createShotAttributeTemplate(ShotAttributeType.ShotMultiSelectAttribute)}>
                    <List size={16} strokeWidth={3}/>Multi select
                </button>
            </>}
        >
            Add shot attribute <Plus size={20}/>
        </SimplePopover>
    )
}