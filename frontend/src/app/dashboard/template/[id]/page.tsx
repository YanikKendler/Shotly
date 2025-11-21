"use client"

import "./template.scss"
import {useParams, useRouter, useSearchParams} from "next/navigation"
import {useApolloClient} from "@apollo/client"
import ErrorPage from "@/pages/errorPage/errorPage"
import LoadingPage from "@/pages/loadingPage/loadingPage"
import React, {useEffect, useState} from "react"
import {
    SceneAttributeTemplateBase, SceneAttributeType,
    ShotAttributeBase,
    ShotAttributeTemplateBase,
    ShotAttributeType,
    ShotlistDto,
    TemplateDto
} from "../../../../../lib/graphql/generated"
import gql from "graphql-tag"
import {wuGeneral} from "@yanikkendler/web-utils"
import {ChevronDown, Info, List, Menu, NotepadText, Pen, Pencil, Plus, Trash, Type} from "lucide-react"
import Input from "@/components/input/input"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import {arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from "@dnd-kit/sortable"
import ShotAttributeDefinition from "@/components/shotAttributeDefinition/shotAttributeDefinition"
import {Collapsible, Popover} from "radix-ui"
import {apolloClient} from "@/ApolloWrapper"
import ShotAttributeTemplate from "@/components/shotAttributeTemplate/shotAttributeTemplate"
import {AnySceneAttributeDefinition, AnyShotAttributeTemplate} from "@/util/Types"
import Utils from "@/util/Utils"
import Link from "next/link"
import SceneAttributeTemplate from "@/components/sceneAttributeTemplate/sceneAttributeTemplate"
import {router} from "next/client"
import {useConfirmDialog} from "@/components/dialog/confirmDialog/confirmDialoge"
import {driver} from "driver.js"

export default function Template (){
    const params = useParams<{ id: string }>()
    const id = params?.id || ""

    const [template, setTemplate] = useState<{data: TemplateDto, loading: boolean, error: any}>({data: {} as TemplateDto, loading: true, error: null})

    const client = useApolloClient()
    const router = useRouter()
    const { confirm, ConfirmDialog } = useConfirmDialog();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
        useSensor(TouchSensor)
    );

    const driverObj = driver({
        showProgress: true,
        allowClose: true,
        steps: [
            { popover: { title: 'Templates', description: 'Templates store any number of attributes for scenes and shotlists. A template can be selected when creating a new shotlist.' } },
            { element: '.attributeTemplates', popover: { title: 'Shot Attributes', description: `Every shotlist that is created based on this template will automatically have a "${template.data.shotAttributes?.at(0)?.name}" column.`, side: "left", align: 'center' }},
            { element: '.infoTrigger', popover: { title: 'More info', description: 'You can always click here to read up on templates.', side: "bottom", align: 'center' }},
            { element: 'button.add', popover: { description: 'Click here to add a new shot attribute to this template.', side: "bottom", align: 'center' }},
        ]
    })

    useEffect(() => {
        if(!id || id.length !== 36)
            setTemplate({data: {} as TemplateDto, loading: false, error: new Error("Invalid template ID")})
        else
            loadTemplate()

        if(localStorage["shotly-template-tour-completed"] != "true") {
            localStorage["shotly-template-tour-completed"] = "true"
            driverObj.drive()
        }
    }, []);

    const loadTemplate = async (noCache: boolean = false) => {
        const { data, errors, loading } = await client.query({query: gql`
                query template($id: String!){
                    template(id: $id) {
                        id
                        name
                        shotAttributes {
                            id
                            name
                            position
                            __typename


                            ... on ShotSingleSelectAttributeTemplateDTO {
                                options {
                                    id
                                    name
                                }
                            }

                            ... on ShotMultiSelectAttributeTemplateDTO {
                                options {
                                    id
                                    name
                                }
                            }
                        }
                        sceneAttributes {
                            id
                            name
                            position
                            __typename
                            
                            ... on SceneSingleSelectAttributeTemplateDTO {
                                options {
                                    id
                                    name
                                }
                            }
                            
                            ... on SceneMultiSelectAttributeTemplateDTO {
                                options {
                                    id
                                    name
                                }
                            }
                        }
                    }
                }`,
            variables: {id: id},
            fetchPolicy: noCache ? "no-cache" : "cache-first"})

        setTemplate({data: data.template, loading: loading, error: errors})
    }

    const updateTemplateName = async (name: string) => {
        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation updateTemplate($templateId: String!, $name: String!) {
                    updateTemplate(editDTO: {
                        id: $templateId
                        name: $name
                    }){
                        id
                        name
                    }
                }
            `,
            variables: { templateId: id, name: name },
        });

        if (errors) {
            console.error(errors);
            return;
        }
    }

    const handleTemplateNameChange = (name: string) => {
        setTemplate({
            ...template,
            data: {
                ...template.data,
                name: name
            }
        })

        debounceUpdateTemplateName(name)
    }

    const debounceUpdateTemplateName = wuGeneral.debounce(updateTemplateName)

    const deleteTemplate = async () => {
        let decision = await confirm({
            title: 'Are you sure?',
            message: `Do you want to delete the template "${template.data.name}". No Shotlists will be affected by this action. This action cannot be undone.`,
            buttons: {
                confirm: {
                    text: 'Delete Template',
                    className: 'bad'
                }
            }
        })

        if(!decision) return

        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation deleteTemplate($templateId: String!) {
                    deleteTemplate(id: $templateId){
                        id
                    }
                }
            `,
            variables: { templateId: id },
        });

        if (errors) {
            console.error(errors);
            return;
        }

        router.push("/dashboard");
    }

    async function createShotAttributeDefinition(type: ShotAttributeType) {
        const {data, errors} = await client.mutate({
            mutation: gql`
                mutation createShotAttributeTemplate($templateId: String!, $attributeType: ShotAttributeType!) {
                    createShotAttributeTemplate(createDTO: {templateId: $templateId, type: $attributeType}) {
                        id
                        name
                        position
                    }
                }
            `,
            variables: {templateId: id, attributeType: type},
        });
        if (errors) {
            console.error(errors);
            return;
        }

        setTemplate({
            ...template,
            data: {
                ...template.data,
                shotAttributes: [...(template.data.shotAttributes || []), data.createShotAttributeTemplate]
            }
        });
    }

    function handleShotDragEnd(event: any) {
        const {active, over} = event;

        if (active.id !== over.id && template.data.shotAttributes) {
            const oldIndex = template.data.shotAttributes.findIndex((definition) => definition!.id === active.id);
            const newIndex = template.data.shotAttributes.findIndex((definition) => definition!.id === over.id);

            apolloClient.mutate({
                mutation: gql`
                    mutation updateShotAttributeTemplatePosition($id: BigInteger!, $position: Int!) {
                        updateShotAttributeTemplate(editDTO:{
                            id: $id,
                            position: $position
                        }){
                            id
                            position
                        }
                    }
                `,
                variables: {id: active.id, position: newIndex},
            })

            setTemplate({
                ...template,
                data: {
                    ...template.data,
                    shotAttributes: arrayMove(template.data.shotAttributes, oldIndex, newIndex)
                }
            })
        }
    }

    function removeShotAttributeTemplate(id: number) {
        if(!template.data.shotAttributes || template.data.shotAttributes.length == 0) return

        let newShotTemplates: AnyShotAttributeTemplate[] = (template.data.shotAttributes as AnyShotAttributeTemplate[]).filter((shotTemplate) => shotTemplate.id != id)

        setTemplate({
            ...template,
            data: {
                ...template.data,
                shotAttributes: newShotTemplates
            }
        })
    }

    async function createSceneAttributeDefinition(type: SceneAttributeType) {
        const {data, errors} = await client.mutate({
            mutation: gql`
                mutation createSceneAttributeTemplate($templateId: String!, $attributeType: SceneAttributeType!) {
                    createSceneAttributeTemplate(createDTO: {templateId: $templateId, type: $attributeType}) {
                        id
                        name
                        position
                    }
                }
            `,
            variables: {templateId: id, attributeType: type},
        });
        if (errors) {
            console.error(errors);
            return;
        }

        setTemplate({
            ...template,
            data: {
                ...template.data,
                sceneAttributes: [...(template.data.sceneAttributes || []), data.createSceneAttributeTemplate]
            }
        });
    }

    function handleSceneDragEnd(event: any) {
        const {active, over} = event;

        if (active.id !== over.id && template.data.sceneAttributes) {
            const oldIndex = template.data.sceneAttributes.findIndex((definition) => definition!.id === active.id);
            const newIndex = template.data.sceneAttributes.findIndex((definition) => definition!.id === over.id);

            apolloClient.mutate({
                mutation: gql`
                    mutation updateSceneAttributeTemplatePosition($id: BigInteger!, $position: Int!) {
                        updateSceneAttributeTemplate(editDTO:{
                            id: $id,
                            position: $position
                        }){
                            id
                            position
                        }
                    }
                `,
                variables: {id: active.id, position: newIndex},
            })

            setTemplate({
                ...template,
                data: {
                    ...template.data,
                    sceneAttributes: arrayMove(template.data.sceneAttributes, oldIndex, newIndex)
                }
            })
        }
    }

    function removeSceneAttributeTemplate(id: number) {
        if(!template.data.sceneAttributes || template.data.sceneAttributes.length == 0) return

        let newSceneTemplates: AnyShotAttributeTemplate[] = (template.data.sceneAttributes as AnyShotAttributeTemplate[]).filter((sceneTemplate) => sceneTemplate.id != id)

        setTemplate({
            ...template,
            data: {
                ...template.data,
                sceneAttributes: newSceneTemplates
            }
        })
    }

    if(template.error) return <main className={"dashboardContent"}><ErrorPage settings={{
        title: 'Data could not be loaded',
        description: template.error.message,
        link: {
            text: 'Dashboard',
            href: '/dashboard'
        }
    }}/></main>

    if(template.loading) return <LoadingPage text={"loading template"}/>

    if(!template.data) return <main className={"dashboardContent"}><ErrorPage settings={{
        title: '404',
        description: 'Sorry, we could not find the template you were looking for. Please check the URL or return to the dashboard.',
        link: {
            text: 'Dashboard',
            href: '/dashboard'
        }
    }}/></main>

    return (
        <main className={"template dashboardContent"}>
            <div className="top">
                <h2>
                    <Input
                        value={template.data.name || ""}
                        placeholder={"template name"}
                        valueChange={handleTemplateNameChange}
                        inputClass={"templateName"}
                        maxLength={80}
                        maxWidth={"90ch"}
                        showError={false}
                    />
                    <div className="spacerContainer">
                        <p className="spacer">{template.data.name}</p>
                        <Pencil size={18} style={{display: template.data.name == "" ? "none" : "block"}}/>
                    </div>
                </h2>

                <Popover.Root defaultOpen={false}>
                    <Popover.Trigger className={"noClickFx default infoTrigger"}>
                        <span>More on Templates</span>
                        <Info size={18}/>
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content className="PopoverContent templateInfo" sideOffset={5}>
                            <p>
                                <span className="dark">Templates can be selected when creating a shotlist so that you don't have to create the same attributes over and over again.</span>
                                <br/>
                                None of the changes made to this templated will be reflected in existing shotlists.
                                Every shotlist manages its own attributes, only those that are created based on this
                                template <i>after</i> it has been edited will use the updated attributes.
                            </p>
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>

                <button className="delete bad" onClick={deleteTemplate}>
                    <span>Delete Template</span>
                    <Trash size={18}/>
                </button>
            </div>
            <h3>Shot Attributes</h3>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleShotDragEnd}
            >
                <SortableContext
                    items={template.data.shotAttributes?.map(def => def!.id) || []}
                    strategy={verticalListSortingStrategy}
                >
                    {
                        template.data.shotAttributes && template.data.shotAttributes.length > 0 &&
                        (<div className="attributeTemplates">
                            {(template.data.shotAttributes as ShotAttributeTemplateBase[]).map(attr =>
                                <ShotAttributeTemplate attributeTemplate={attr} onDelete={removeShotAttributeTemplate}
                                                       key={attr.id}/>
                            )}
                        </div>)
                    }
                </SortableContext>
            </DndContext>
            <Popover.Root>
                <Popover.Trigger className={"add"}>Add Shot Attribute <Plus size={20}/></Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content className="PopoverContent addAttributeTemplatePopup" sideOffset={5}
                                     align={"start"}>
                        <button onClick={() => createShotAttributeDefinition(ShotAttributeType.ShotTextAttribute)}><Type
                            size={16} strokeWidth={3}/>Text
                        </button>
                        <button
                            onClick={() => createShotAttributeDefinition(ShotAttributeType.ShotSingleSelectAttribute)}>
                            <ChevronDown size={16} strokeWidth={3}/>Single select
                        </button>
                        <button
                            onClick={() => createShotAttributeDefinition(ShotAttributeType.ShotMultiSelectAttribute)}>
                            <List size={16} strokeWidth={3}/>Multi select
                        </button>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
            <h3>Scene Attributes</h3>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSceneDragEnd}
            >
                <SortableContext
                    items={template.data.sceneAttributes?.map(def => def!.id) || []}
                    strategy={verticalListSortingStrategy}
                >
                    {
                        template.data.sceneAttributes && template.data.sceneAttributes.length > 0 &&
                        (<div className="attributeTemplates">
                            {(template.data.sceneAttributes as SceneAttributeTemplateBase[]).map(attr =>
                                <SceneAttributeTemplate attributeTemplate={attr} onDelete={removeSceneAttributeTemplate}
                                                        key={attr.id}/>
                            )}
                        </div>)
                    }
                </SortableContext>
            </DndContext>
            <Popover.Root>
                <Popover.Trigger className={"add"}>Add Scene Attribute <Plus size={20}/></Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content className="PopoverContent addAttributeTemplatePopup" sideOffset={5}
                                     align={"start"}>
                        <button onClick={() => createSceneAttributeDefinition(SceneAttributeType.SceneTextAttribute)}>
                            <Type size={16} strokeWidth={3}/>Text
                        </button>
                        <button
                            onClick={() => createSceneAttributeDefinition(SceneAttributeType.SceneSingleSelectAttribute)}>
                            <ChevronDown size={16} strokeWidth={3}/>Single select
                        </button>
                        <button
                            onClick={() => createSceneAttributeDefinition(SceneAttributeType.SceneMultiSelectAttribute)}>
                            <List size={16} strokeWidth={3}/>Multi select
                        </button>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
            {ConfirmDialog}
        </main>
    )
}