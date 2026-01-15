'use client'

import {
    AnySceneAttribute, AnySceneAttributeDefinition,
    SceneAttributeValueCollection,
    SceneSingleOrMultiSelectAttributeDefinition
} from "@/util/Types"
import './sceneAttributeDefinition.scss'
import {GripVertical, ListCollapse, Pencil, Plus, Trash} from "lucide-react"
import {useSortable} from "@dnd-kit/sortable"
import {CSS} from '@dnd-kit/utilities';
import {SceneAttributeDefinitionParser} from "@/util/AttributeParser"
import gql from "graphql-tag"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialoge"
import {useApolloClient} from "@apollo/client"
import {SceneDto, SceneSelectAttributeOptionDefinition} from "../../../../../../lib/graphql/generated"
import { Popover } from "radix-ui"
import {useEffect, useState} from "react"
import {wuGeneral} from "@yanikkendler/web-utils"

export default function SceneAttributeDefinition({attributeDefinition, onDelete, dataChanged}: {attributeDefinition: AnySceneAttributeDefinition, onDelete: (id: number) => void, dataChanged: () => void}) {

    const [definition, setDefiniton] = useState<AnySceneAttributeDefinition>({} as AnySceneAttributeDefinition)

    // @ts-ignore
    const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition} = useSortable({id: attributeDefinition.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const Icon = SceneAttributeDefinitionParser.toIcon(definition);

    const { confirm, ConfirmDialog } = useConfirmDialog();
    const client = useApolloClient()

    useEffect(() => {
        setDefiniton(attributeDefinition)
    }, [attributeDefinition])

    async function updateDefinition(newName: string) {
        const {data, errors} = await client.mutate({
            mutation: gql`
                mutation updateSceneAttributeDefinition($id: BigInteger!, $name: String!) {
                    updateSceneAttributeDefinition(editDTO: {
                        id: $id
                        name: $name
                    }){ id }
                }
            `,
            variables: {id: definition.id, name: newName},
        });
        if (errors) {
            console.error(errors)
        }

        setDefiniton({
            ...definition,
            name: newName
        })

        dataChanged()
    }

    const debouncedUpdateDefinition = wuGeneral.debounce(updateDefinition)

    const deleteDefinition = async () => {


        if(!await confirm({
            message: `The attribute definition "${definition.name || 'unnamed'}" will be deleted. All scenes in this shotlist will lose the column "${definition.name || 'unnamed'}" and with that: all the values in that column.`,
            buttons: {confirm: {className: "bad"}}}
        )) return

        const { errors } = await client.mutate({
            mutation: gql`
                mutation deleteSceneAttributeDefinition($definitionId: BigInteger!) {
                    deleteSceneAttributeDefinition(id: $definitionId) {
                        id
                    }
                }
            `,
            variables: { definitionId: definition.id },
        });

        if(errors) {
            console.error(errors)
        }
        else{
            onDelete(definition.id)
        }
    }

    const createSelectOption = async () => {
        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation createSceneSelectAttributeOption($definitionId: BigInteger!) {
                    createSceneSelectAttributeOption(createDTO: {
                        attributeDefinitionId: $definitionId
                    }) {
                        id
                        name
                    }
                }
            `,
            variables: { definitionId: definition.id },
        });

        if (errors) {
            console.error(errors);
            return;
        }

        let currentOptions = (definition as SceneSingleOrMultiSelectAttributeDefinition).options as SceneSelectAttributeOptionDefinition[]
        let newOptions: SceneSelectAttributeOptionDefinition[] = []
        if(currentOptions) newOptions = [...currentOptions]
        newOptions.push(data.createSceneSelectAttributeOption)

        setDefiniton({
            ...definition,
            options: newOptions
        })

        dataChanged()
    }

    const deleteSelectOption = async (optionId: number) => {
        const { errors } = await client.mutate({
            mutation: gql`
                mutation deleteSceneSelectAttributeOption($optionId: BigInteger!) {
                    deleteSceneSelectAttributeOption(id: $optionId) {
                        id
                    }
                }
            `,
            variables: { optionId: optionId },
        });

        if(errors) {
            console.error(errors)
        }

        let newOptions: SceneSelectAttributeOptionDefinition[] = (definition as SceneSingleOrMultiSelectAttributeDefinition)?.options?.filter(option => option?.id != optionId) as SceneSelectAttributeOptionDefinition[] || []

        setDefiniton({
            ...definition,
            options: newOptions
        })

        dataChanged()
    }

    const updateOptionName = async (optionId: number, newName: string) => {
        const {data, errors} = await client.mutate({
            mutation : gql`
                mutation updateSceneSelectAttributeOption($id: BigInteger!, $name: String!) {
                    updateSceneSelectAttributeOption(editDTO: {
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

        let currentOptions = (definition as SceneSingleOrMultiSelectAttributeDefinition).options as SceneSelectAttributeOptionDefinition[]
        let newOptions: SceneSelectAttributeOptionDefinition[] = currentOptions.map(option => {
            if(option.id == optionId) {
                return {
                    ...option,
                    name: newName
                }
            }
            return option
        })

        setDefiniton({
            ...definition,
            options: newOptions
        })

        dataChanged()
    }

    const debouncedUpdateOptionName = wuGeneral.debounce(updateOptionName)

    if(!definition || !definition.id) return (<p>Loading...</p>)

    return (
        <div className={"sceneAttributeDefinition"} ref={setNodeRef} style={style}>
            <div
                className="grip"
                ref={setActivatorNodeRef}
                {...listeners}
                {...attributes}
            >
                <GripVertical/>
            </div>
            <Icon size={20} strokeWidth={3}/>
            <input type="text" defaultValue={definition.name || ""} placeholder={"Attribute name"} onInput={(e) => debouncedUpdateDefinition(e.currentTarget.value)}/>
            {(definition.type == "SceneMultiSelectAttributeDefinitionDTO" || definition.type == "SceneSingleSelectAttributeDefinitionDTO") && (
                <Popover.Root modal={true}>
                    <Popover.Trigger><span>Edit options</span> <ListCollapse size={18}/></Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content className="PopoverContent editSceneAttributeOptionsPopup" sideOffset={5} align={"start"}>
                            {((definition as SceneSingleOrMultiSelectAttributeDefinition).options as SceneSelectAttributeOptionDefinition[])?.map((option, index) => (
                                <div className="option" key={option.id}>
                                    <p>{index + 1}</p>
                                    <input
                                        type="text"
                                        defaultValue={option.name || ""}
                                        placeholder="Option name"
                                        onInput={(event) => debouncedUpdateOptionName(option.id, event.currentTarget.value)}
                                    />
                                    <button className="bad" onClick={() => deleteSelectOption(option.id)}><Trash size={18}/></button>
                                </div>
                            ))}
                            <button onClick={createSelectOption}><Plus size={18}/>Add option</button>
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
            )}
            <button className="delete bad" onClick={deleteDefinition}><Trash size={18}/></button>
            {ConfirmDialog}
        </div>
    );
}
