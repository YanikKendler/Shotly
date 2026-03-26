import {
    SceneAttributeTemplateBaseDto,
    SceneSelectAttributeOptionTemplate
} from "../../../../lib/graphql/generated"
import {Grip, GripVertical, Pencil, Plus, Trash} from "lucide-react"
import {useEffect, useState} from "react"
import {
    AnySceneAttributeTemplate,
    SceneSingleOrMultiSelectAttributeTemplate, ShotSingleOrMultiSelectAttributeTemplate
} from "@/util/Types"
import {useSortable} from "@dnd-kit/sortable"
import {CSS} from "@dnd-kit/utilities"
import {SceneAttributeTemplateParser} from "@/util/AttributeParser"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialog"
import {useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {wuGeneral} from "@yanikkendler/web-utils/dist"
import {Popover} from "radix-ui"
import "./sceneAttributeTemplate.scss"
import TextField from "@/components//inputs/textField/textField"
import {errorNotification} from "@/service/NotificationService"

export default function SceneAttributeTemplate({attributeTemplate, onDelete}: { attributeTemplate: SceneAttributeTemplateBaseDto, onDelete: (id: number) => void }) {
    const [attribute, setAttribute] = useState<AnySceneAttributeTemplate>({} as AnySceneAttributeTemplate)

    // @ts-ignore
    const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition} = useSortable({id: attributeTemplate.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const Icon = SceneAttributeTemplateParser.toIcon(attribute);

    const { confirm, ConfirmDialog } = useConfirmDialog();
    const client = useApolloClient()

    useEffect(() => {
        setAttribute(attributeTemplate)
    }, [attributeTemplate])

    async function updateAttributeTemplate(newName: string) {
        const {data, errors} = await client.mutate({
            mutation: gql`
                mutation updateSceneAttributeTemplateName($id: BigInteger!, $name: String!) {
                    updateSceneAttributeTemplate(editDTO: {
                        id: $id
                        name: $name
                    }){ id }
                }
            `,
            variables: {id: attribute.id, name: newName},
        });
        if (errors) {
            errorNotification({
                title: "Failed to update attribute template",
                tryAgainLater: true
            })
            console.error(errors)
            return
        }

        setAttribute(current => ({
            ...current,
            name: newName
        }))
    }

    const debouncedUpdateTemplate = wuGeneral.debounce(updateAttributeTemplate)

    const deleteAttributeTemplate = async () => {
        if(!await confirm({
            message: `The attribute definition template "${attribute.name || 'unnamed'}" will be deleted. This will not affect any existing shotlists or their scenes.`,
            buttons: {confirm: {className: "bad"}}}
        )) return

        const { errors } = await client.mutate({
            mutation: gql`
                mutation deleteSceneAttributeTemplate($definitionId: BigInteger!) {
                    deleteSceneAttributeTemplate(id: $definitionId) {
                        id
                    }
                }
            `,
            variables: { definitionId: attribute.id },
        });

        if(errors) {
            errorNotification({
                title: "Failed to delete attribute template",
                tryAgainLater: true
            })
            console.error(errors)
            return
        }
        else{
            onDelete(attribute.id)
        }
    }

    const createSelectOption = async () => {
        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation createSceneSelectAttributeOptionTemplate($templateId: BigInteger!) {
                    createSceneSelectAttributeOptionTemplate(attributeTemplateId: $templateId) {
                        id
                        name
                    }
                }
            `,
            variables: { templateId: attribute.id },
        })

        if (errors) {
            errorNotification({
                title: "Failed to create select option template",
                tryAgainLater: true
            })
            console.error(errors);
            return;
        }

        setAttribute(current => {
            let currentOptions = (current as SceneSingleOrMultiSelectAttributeTemplate).options as SceneSelectAttributeOptionTemplate[]
            let newOptions: SceneSelectAttributeOptionTemplate[] = []
            if(currentOptions) newOptions = [...currentOptions]
            newOptions.push(data.createSceneSelectAttributeOptionTemplate)

            return {
                ...current,
                options: newOptions
            }
        })
    }

    const deleteSelectOption = async (optionId: number) => {
        const { errors } = await client.mutate({
            mutation: gql`
                mutation deleteSceneSelectAttributeOptionTemplate($optionId: BigInteger!) {
                    deleteSceneSelectAttributeOptionTemplate(id: $optionId) {
                        id
                    }
                }
            `,
            variables: { optionId: optionId },
        });

        if(errors) {
            errorNotification({
                title: "Failed to delete select option template",
                tryAgainLater: true
            })
            console.error(errors)
            return
        }

        setAttribute(current => {
            let newOptions: SceneSelectAttributeOptionTemplate[] =
                (current as SceneSingleOrMultiSelectAttributeTemplate)
                    ?.options
                    ?.filter(option => option?.id != optionId) as SceneSelectAttributeOptionTemplate[]
                || []

            return {
                ...current,
                options: newOptions
            }
        })
    }

    const updateOptionName = async (optionId: number, newName: string) => {
        const {data, errors} = await client.mutate({
            mutation : gql`
                mutation updateSceneSelectAttributeOptionTemplate($id: BigInteger!, $name: String!) {
                    updateSceneSelectAttributeOptionTemplate(editDTO: {
                        id: $id
                        name: $name
                    }){ id }
                }
            `,
            variables: {id: optionId, name: newName},
        });
        if(errors) {
            errorNotification({
                title: "Failed to update select option template",
                tryAgainLater: true
            })
            console.error(errors)
            return
        }

        setAttribute(current => {
            let currentOptions = (current as SceneSingleOrMultiSelectAttributeTemplate).options as SceneSelectAttributeOptionTemplate[]
            let newOptions: SceneSelectAttributeOptionTemplate[] = currentOptions.map(option => {
                if(option.id == optionId) {
                    return {
                        ...option,
                        name: newName
                    }
                }
                return option
            })

            return {
                ...current,
                options: newOptions
            }
        })
    }

    const debouncedUpdateOptionName = wuGeneral.debounce(updateOptionName)

    return (
        <div className={"sceneAttributeTemplate"} ref={setNodeRef} style={style}>
            <div
                className="grip"
                ref={setActivatorNodeRef}
                {...listeners}
                {...attributes}
            >
                <GripVertical/>
            </div>
            <Icon size={18} strokeWidth={3}/>
            <TextField
                defaultValue={attribute.name || ""}
                valueChange={debouncedUpdateTemplate}
                placeholder={"Attribute name"}
                inputClass={"nameInput"}
            />
            {(attribute.type == "SceneMultiSelectAttributeTemplateDTO" || attribute.type == "SceneSingleSelectAttributeTemplateDTO") && (
                <Popover.Root>
                    <Popover.Trigger className={"editOptions"}>Edit options <Pencil size={16}/></Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content className="popoverContent editAttributeOptionTemplatesPopup" sideOffset={5}
                                         align={"start"}>
                            {((attribute as SceneSingleOrMultiSelectAttributeTemplate).options as SceneSelectAttributeOptionTemplate[])?.map((option, index) => (
                                <div className="option" key={option?.id}>
                                    <p>{index + 1}</p>
                                    <input
                                        type="text"
                                        defaultValue={option?.name || ""}
                                        placeholder="Option name"
                                        onInput={(event) => debouncedUpdateOptionName(option.id, event.currentTarget.value)}
                                    />
                                    <button className="bad" onClick={() => deleteSelectOption(option.id)}><Trash
                                        size={18}/></button>
                                </div>
                            ))}
                            <button onClick={createSelectOption}><Plus size={18}/>Add option</button>
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
            )}
            <button className="delete bad" onClick={deleteAttributeTemplate}><Trash size={18}/></button>
            {ConfirmDialog}
        </div>
    );
}