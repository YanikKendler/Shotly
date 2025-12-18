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
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialoge"
import {useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {wuGeneral} from "@yanikkendler/web-utils/dist"
import {Popover} from "radix-ui"
import "./sceneAttributeTemplate.scss"
import Input from "@/components/inputs/input/input"

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

    async function updateDefinition(newName: string) {
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
            console.error(errors)
        }

        setAttribute({
            ...attribute,
            name: newName
        })
    }

    const debouncedUpdateDefinition = wuGeneral.debounce(updateDefinition)

    const deleteAttributeTemplate = async () => {
        if(!await confirm({
            message: `The attribute definition "${attribute.name || 'unnamed'}" will be deleted. This will not affect any existing scenelists or their scenes.`,
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
            console.error(errors)
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
            console.error(errors);
            return;
        }

        let currentOptions = (attribute as SceneSingleOrMultiSelectAttributeTemplate).options as SceneSelectAttributeOptionTemplate[]
        let newOptions: SceneSelectAttributeOptionTemplate[] = []
        if(currentOptions) newOptions = [...currentOptions]
        newOptions.push(data.createSceneSelectAttributeOptionTemplate)

        setAttribute({
            ...attribute,
            options: newOptions
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
            console.error(errors)
        }

        let newOptions: SceneSelectAttributeOptionTemplate[] =
            (attribute as SceneSingleOrMultiSelectAttributeTemplate)
                ?.options
                ?.filter(option => option?.id != optionId) as SceneSelectAttributeOptionTemplate[]
            || []

        setAttribute({
            ...attribute,
            options: newOptions
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
            console.error(errors)
        }

        let currentOptions = (attribute as SceneSingleOrMultiSelectAttributeTemplate).options as SceneSelectAttributeOptionTemplate[]
        let newOptions: SceneSelectAttributeOptionTemplate[] = currentOptions.map(option => {
            if(option.id == optionId) {
                return {
                    ...option,
                    name: newName
                }
            }
            return option
        })

        setAttribute({
            ...attribute,
            options: newOptions
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
            <Icon size={20} strokeWidth={3}/>
            <Input
                defaultValue={attribute.name || ""}
                valueChange={debouncedUpdateDefinition}
                placeholder={"Attribute name"}
                inputClass={"nameInput"}
            />
            {(attribute.type == "SceneMultiSelectAttributeTemplateDTO" || attribute.type == "SceneSingleSelectAttributeTemplateDTO") && (
                <Popover.Root>
                    <Popover.Trigger className={"editOptions"}>Edit options <Pencil size={16}/></Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content className="PopoverContent editAttributeOptionTemplatesPopup" sideOffset={5}
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