import {
    ShotAttributeTemplateBaseDto,
    ShotSelectAttributeOptionTemplate
} from "../../../../lib/graphql/generated"
import {Grip, GripVertical, Pencil, Plus, Trash} from "lucide-react"
import {useEffect, useState} from "react"
import {
    AnyShotAttributeTemplate,
    ShotSingleOrMultiSelectAttributeTemplate
} from "@/util/Types"
import {useSortable} from "@dnd-kit/sortable"
import {CSS} from "@dnd-kit/utilities"
import {ShotAttributeTemplateParser} from "@/util/AttributeParser"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialoge"
import {useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {wuGeneral} from "@yanikkendler/web-utils/dist"
import {Popover} from "radix-ui"
import "./shotAttributeTemplate.scss"
import TextField from "@/components//inputs/textField/textField"

export default function ShotAttributeTemplate({attributeTemplate, onDelete}: { attributeTemplate: ShotAttributeTemplateBaseDto, onDelete: (id: number) => void }) {
    const [attribute, setAttribute] = useState<AnyShotAttributeTemplate>({} as AnyShotAttributeTemplate)

    // @ts-ignore
    const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition} = useSortable({id: attributeTemplate.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const Icon = ShotAttributeTemplateParser.toIcon(attribute);

    const { confirm, ConfirmDialog } = useConfirmDialog();
    const client = useApolloClient()

    useEffect(() => {
        setAttribute(attributeTemplate)
    }, [attributeTemplate])

    async function updateDefinition(newName: string) {
        const {data, errors} = await client.mutate({
            mutation: gql`
                mutation updateShotAttributeTemplateName($id: BigInteger!, $name: String!) {
                    updateShotAttributeTemplate(editDTO: {
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
            message: `The attribute definition "${attribute.name || 'unnamed'}" will be deleted. This will not affect any existing shotlists or their shots.`,
            buttons: {confirm: {className: "bad"}}}
        )) return

        const { errors } = await client.mutate({
            mutation: gql`
                mutation deleteShotAttributeTemplate($definitionId: BigInteger!) {
                    deleteShotAttributeTemplate(id: $definitionId) {
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
                mutation createShotSelectAttributeOptionTemplate($templateId: BigInteger!) {
                    createShotSelectAttributeOptionTemplate(attributeTemplateId: $templateId) {
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

        let currentOptions = (attribute as ShotSingleOrMultiSelectAttributeTemplate).options as ShotSelectAttributeOptionTemplate[]
        let newOptions: ShotSelectAttributeOptionTemplate[] = []
        if(currentOptions) newOptions = [...currentOptions]
        newOptions.push(data.createShotSelectAttributeOptionTemplate)

        setAttribute({
            ...attribute,
            options: newOptions
        })
    }

    const deleteSelectOption = async (optionId: number) => {
        const { errors } = await client.mutate({
            mutation: gql`
                mutation deleteShotSelectAttributeOptionTemplate($optionId: BigInteger!) {
                    deleteShotSelectAttributeOptionTemplate(id: $optionId) {
                        id
                    }
                }
            `,
            variables: { optionId: optionId },
        });

        if(errors) {
            console.error(errors)
        }

        let newOptions: ShotSelectAttributeOptionTemplate[] =
            (attribute as ShotSingleOrMultiSelectAttributeTemplate)
                ?.options
                ?.filter(option => option?.id != optionId) as ShotSelectAttributeOptionTemplate[]
            || []

        setAttribute({
            ...attribute,
            options: newOptions
        })
    }

    const updateOptionName = async (optionId: number, newName: string) => {
        const {data, errors} = await client.mutate({
            mutation : gql`
                mutation updateShotSelectAttributeOptionTemplate($id: BigInteger!, $name: String!) {
                    updateShotSelectAttributeOptionTemplate(editDTO: {
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

        let currentOptions = (attribute as ShotSingleOrMultiSelectAttributeTemplate).options as ShotSelectAttributeOptionTemplate[]
        let newOptions: ShotSelectAttributeOptionTemplate[] = currentOptions.map(option => {
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
        <div className={"shotAttributeTemplate"} ref={setNodeRef} style={style}>
            <div
                className="grip"
                ref={setActivatorNodeRef}
                {...listeners}
                {...attributes}
            >
                <GripVertical/>
            </div>
            <Icon size={20} strokeWidth={3}/>
            <TextField
                defaultValue={attribute.name || ""}
                valueChange={debouncedUpdateDefinition}
                placeholder={"Attribute name"}
                inputClass={"nameInput"}
            />
            {(attribute.type == "ShotMultiSelectAttributeTemplateDTO" || attribute.type == "ShotSingleSelectAttributeTemplateDTO") && (
                <Popover.Root>
                    <Popover.Trigger className={"editOptions"}>Edit options <Pencil size={16}/></Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content className="popoverContent editAttributeOptionTemplatesPopup" sideOffset={5}
                                         align={"start"}>
                            {((attribute as ShotSingleOrMultiSelectAttributeTemplate).options as ShotSelectAttributeOptionTemplate[])?.map((option, index) => (
                                <div className="option" key={option?.id}>
                                    <p>{index + 1}</p>
                                    <TextField
                                        defaultValue={option?.name || ""}
                                        placeholder="Option name"
                                        valueChange={(value) => updateOptionName(option.id, value)}
                                        debounceValueChange={true}
                                    />
                                    <button className="bad" onClick={() => deleteSelectOption(option.id)}><Trash size={18}/></button>
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