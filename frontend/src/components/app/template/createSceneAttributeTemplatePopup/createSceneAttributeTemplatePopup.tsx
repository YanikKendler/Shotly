import Skeleton from "react-loading-skeleton"
import {Dispatch, SetStateAction, useRef} from "react"
import {Query, SceneAttributeType, ShotAttributeType} from "../../../../../lib/graphql/generated"
import {ChevronDown, List, Plus, Type} from "lucide-react"
import SimplePopover, {SimplePopoverRef} from "@/components/basic/popover/simplePopover"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {errorNotification} from "@/service/NotificationService"

export default function CreateSceneAttributeTemplatePopup({
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

    async function createSceneAttributeTemplate(type: SceneAttributeType) {
        popoverRef.current?.close()

        const {data, errors} = await client.mutate({
            mutation: gql`
                mutation createSceneAttributeTemplate($templateId: String!, $attributeType: SceneAttributeType!) {
                    createSceneAttributeTemplate(createDTO: {templateId: $templateId, type: $attributeType}) {
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
                title: "Failed to create scene attribute definition",
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
                    sceneAttributes: [...(current.data.template?.sceneAttributes || []), data.createSceneAttributeTemplate]
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
                <button onClick={() => createSceneAttributeTemplate(SceneAttributeType.SceneTextAttribute)}>
                    <Type size={16} strokeWidth={3}/>Text
                </button>
                <button
                    onClick={() => createSceneAttributeTemplate(SceneAttributeType.SceneSingleSelectAttribute)}>
                    <ChevronDown size={16} strokeWidth={3}/>Single select
                </button>
                <button
                    onClick={() => createSceneAttributeTemplate(SceneAttributeType.SceneMultiSelectAttribute)}>
                    <List size={16} strokeWidth={3}/>Multi select
                </button>
            </>}
        >
            Add scene attribute <Plus size={20}/>
        </SimplePopover>
    )
}