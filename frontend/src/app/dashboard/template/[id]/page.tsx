"use client"

import "./template.scss"
import {useParams, useRouter, useSearchParams} from "next/navigation"
import {ApolloError, ApolloQueryResult, useApolloClient} from "@apollo/client"
import ErrorPage from "@/components/feedback/errorPage/errorPage"
import LoadingPage from "@/components/feedback/loadingPage/loadingPage"
import React, {useEffect, useState} from "react"
import {
    Query,
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
import Input from "@/components/inputs/input/input"
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
import ShotAttributeDefinition from "@/components/dialogs/shotlistOptionsDialog/attributeTab/shotAttributeDefinition/shotAttributeDefinition"
import {Collapsible, Popover} from "radix-ui"
import {apolloClient} from "@/components/wrapper/ApolloWrapper"
import ShotAttributeTemplate from "@/components/template/shotAttributeTemplate/shotAttributeTemplate"
import {AnySceneAttributeDefinition, AnyShotAttributeTemplate} from "@/util/Types"
import Utils, {Config} from "@/util/Utils"
import Link from "next/link"
import SceneAttributeTemplate from "@/components/template/sceneAttributeTemplate/sceneAttributeTemplate"
import {router} from "next/client"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialoge"
import {driver} from "driver.js"
import Skeleton from "react-loading-skeleton"

export default function Template (){
    const params = useParams<{ id: string }>()
    const id = params?.id || ""

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

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
            { element: '.attributeTemplates', popover: { title: 'Shot Attributes', description: `Every shotlist that is created based on this template will automatically have a "${query.data.template?.shotAttributes?.at(0)?.name}" column.`, side: "left", align: 'center' }},
            { element: '.infoTrigger', popover: { title: 'More info', description: 'You can always click here to read up on templates.', side: "bottom", align: 'center' }},
            { element: 'button.add', popover: { description: 'Click here to add a new shot attribute to this template.', side: "bottom", align: 'center' }},
        ]
    })

    useEffect(() => {
        if(!id || id.length !== 36) {
            setQuery({...query, error: new ApolloError({errorMessage: "Invalid template ID"})})
        }
        else {
            loadTemplate()
        }

        if(localStorage.getItem(Config.localStorageKey.templateTourCompleted) != "true") {
            localStorage.setItem(Config.localStorageKey.templateTourCompleted,"true")
            driverObj.drive()
        }
    }, []);

    const loadTemplate = async (noCache: boolean = false) => {
        const result = await client.query({query: gql`
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

        setQuery(result)
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
        setQuery({
            ...query,
            data: {
                ...query.data,
                template: {
                    ...query.data.template,
                    name: name
                }
            }
        })

        debounceUpdateTemplateName(name)
    }

    const debounceUpdateTemplateName = wuGeneral.debounce(updateTemplateName)

    const deleteTemplate = async () => {
        let decision = await confirm({
            title: 'Are you sure?',
            message: `Do you want to delete the template "${query.data.template?.name || "Unknown"}". No Shotlists will be affected by this action. This action cannot be undone.`,
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

        setQuery({
            ...query,
            data: {
                ...query.data,
                template:{
                    ...query.data.template,
                    shotAttributes: [
                        ...(query.data.template?.shotAttributes || []),
                        data.createShotAttributeTemplate
                    ]
                }
            }
        });
    }

    function handleShotDragEnd(event: any) {
        const {active, over} = event;

        if (active.id !== over.id && query.data.template && query.data.template.shotAttributes) {
            const oldIndex = query.data.template.shotAttributes.findIndex((definition) => definition!.id === active.id);
            const newIndex = query.data.template.shotAttributes.findIndex((definition) => definition!.id === over.id);

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

            setQuery({
                ...query,
                data: {
                    ...query.data,
                    template:{
                        ...query.data.template,
                        shotAttributes: arrayMove(query.data.template.shotAttributes, oldIndex, newIndex)
                    }
                }
            })
        }
    }

    function removeShotAttributeTemplate(id: number) {
        if(!query.data.template || !query.data.template.shotAttributes || query.data.template.shotAttributes.length == 0) return

        let newShotAttributes: AnyShotAttributeTemplate[] = (query.data.template.shotAttributes as AnyShotAttributeTemplate[]).filter((shotTemplate) => shotTemplate.id != id)

        setQuery({
            ...query,
            data: {
                ...query.data,
                template:{
                    ...query.data.template,
                    shotAttributes: newShotAttributes
                }
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

        setQuery({
            ...query,
            data: {
                ...query.data,
                template:{
                    ...query.data.template,
                    sceneAttributes: [...(query.data.template?.sceneAttributes || []), data.createSceneAttributeTemplate]
                }
            }
        });
    }

    function handleSceneDragEnd(event: any) {
        const {active, over} = event;

        if (active.id !== over.id && query.data.template && query.data.template.sceneAttributes) {
            const oldIndex = query.data.template.sceneAttributes.findIndex((definition) => definition!.id === active.id);
            const newIndex = query.data.template.sceneAttributes.findIndex((definition) => definition!.id === over.id);

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

            setQuery({
                ...query,
                data: {
                    ...query.data,
                    template:{
                        ...query.data.template,
                        sceneAttributes: arrayMove(query.data.template.sceneAttributes, oldIndex, newIndex)
                    }
                }
            })
        }
    }

    function removeSceneAttributeTemplate(id: number) {
        if(!query.data.template || !query.data.template.sceneAttributes || query.data.template.sceneAttributes.length == 0) return

        let newSceneTemplates: AnyShotAttributeTemplate[] = (query.data.template.sceneAttributes as AnyShotAttributeTemplate[]).filter((sceneTemplate) => sceneTemplate.id != id)

        setQuery({
            ...query,
            data: {
                ...query.data,
                template:{
                    ...query.data.template,
                    sceneAttributes: newSceneTemplates
                }
            }
        })
    }

    if(query.error) return <main className={"dashboardContent"}>
        <ErrorPage
            title='Data could not be loaded'
            description={query.error.message}
            link={{
                text: 'Dashboard',
                href: '/dashboard'
            }}
        />
    </main>

    if(!query.data) return <main className={"dashboardContent"}>
        <ErrorPage
            title="404"
            description='Sorry, we could not find the template you were looking for. Please check the URL or return to the dashboard.'
            link= {{
                text: 'Dashboard',
                href: '/dashboard'
            }}
        />
    </main>

    return (
        <main className={"template dashboardContent"}>
            <div className="top">
                <h2>
                    {
                        query.loading ?
                        <Skeleton height="2rem"/> :
                        <>
                            <Input
                                value={query.data.template?.name || ""}
                                placeholder={"template name"}
                                valueChange={handleTemplateNameChange}
                                inputClass={"templateName"}
                                maxLength={80}
                                maxWidth={"90ch"}
                                showLengthError={false}
                            />
                            <div className="spacerContainer">
                                <p className="spacer">{query.data.template?.name}</p>
                                <Pencil size={18}
                                        style={{display: query.data.template?.name == "" ? "none" : "block"}}/>
                            </div>
                        </>
                    }
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
                    items={query.data.template?.shotAttributes?.map(def => def!.id) || []}
                    strategy={verticalListSortingStrategy}
                >
                    {
                        query.loading ?
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <Skeleton height="2rem" count={2}/>
                        </div> :
                        query.data.template && query.data.template.shotAttributes && query.data.template.shotAttributes.length > 0 &&
                        (<div className="attributeTemplates">
                            {(query.data.template.shotAttributes as ShotAttributeTemplateBase[]).map(attr =>
                                <ShotAttributeTemplate attributeTemplate={attr} onDelete={removeShotAttributeTemplate}
                                                       key={attr.id}/>
                            )}
                        </div>)
                    }
                </SortableContext>
            </DndContext>
            {
                query.loading ?
                <Skeleton height="2rem" count={2}/> :
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
            }

            <h3>Scene Attributes</h3>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSceneDragEnd}
            >
                <SortableContext
                    items={query.data.template?.sceneAttributes?.map(def => def!.id) || []}
                    strategy={verticalListSortingStrategy}
                >
                    {
                        query.loading ?
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <Skeleton height="2rem" count={2}/>
                        </div> :
                        query.data.template && query.data.template.sceneAttributes && query.data.template.sceneAttributes.length > 0 &&
                        (<div className="attributeTemplates">
                            {(query.data.template.sceneAttributes as SceneAttributeTemplateBase[]).map(attr =>
                                <SceneAttributeTemplate attributeTemplate={attr} onDelete={removeSceneAttributeTemplate}
                                                        key={attr.id}/>
                            )}
                        </div>)
                    }
                </SortableContext>
            </DndContext>
            {
                query.loading ?
                <Skeleton height="2rem" count={2}/> :
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
                }
            {ConfirmDialog}
        </main>
    )
}