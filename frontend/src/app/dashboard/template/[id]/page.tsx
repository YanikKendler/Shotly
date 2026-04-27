"use client"

import "./template.scss"
import {useParams, useRouter} from "next/navigation"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import ErrorPage from "@/components/app/feedback/errorPage/errorPage"
import React, {useEffect, useState} from "react"
import {
    Query,
    SceneAttributeTemplateBase,
    ShotAttributeTemplateBase,
} from "../../../../../lib/graphql/generated"
import gql from "graphql-tag"
import {wuGeneral} from "@yanikkendler/web-utils"
import { Info, Pencil, Trash } from "lucide-react"
import TextField from "@/components/basic/textField/textField"
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
import ShotAttributeTemplate from "@/components/app/template/shotAttributeTemplate/shotAttributeTemplate"
import {AnyShotAttributeTemplate, ShotlyErrorCode} from "@/utility/Types"
import Utils, {uuidRegex} from "@/utility/Utils"
import Config from "@/Config"
import Link from "next/link"
import SceneAttributeTemplate from "@/components/app/template/sceneAttributeTemplate/sceneAttributeTemplate"
import {useConfirmDialog} from "@/components/app/dialogs/confirmDialog/confirmDialog"
import {driver} from "driver.js"
import Skeleton from "react-loading-skeleton"
import auth from "@/Auth"
import SimplePopover from "@/components/basic/popover/simplePopover"
import {errorNotification, successNotification} from "@/service/NotificationService"
import {td} from "@/service/Analytics"
import CreateShotAttributeTemplatePopup
    from "@/components/app/template/createShotAttributeTemplatePopup/createShotAttributeTemplatePopup"
import CreateSceneAttributeTemplatePopup
    from "@/components/app/template/createSceneAttributeTemplatePopup/createSceneAttributeTemplatePopup"

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
            { element: '.attributeTemplates', popover: { title: 'Shot Attributes', description: `Every shotlist that is created based on this template will automatically have all the attributes that are defined here.`, side: "left", align: 'center' }},
            { element: '.infoTrigger', popover: { title: 'More info', description: 'You can always click here to read up on templates.', side: "bottom", align: 'center' }},
            { element: 'button.add', popover: { description: 'Click here to add a new shot attribute to this template.', side: "bottom", align: 'center' }},
        ]
    })

    useEffect(() => {
        //validate template id
        if(!uuidRegex.test(id)){
            setQuery(current => ({
                ...current,
                errors: [{
                    message: "Invalid template id",
                    extensions: { code: ShotlyErrorCode.NOT_FOUND }
                }]
            }))
            return
        }

        if(!auth.getUser()) return

        loadTemplate()

        if(localStorage.getItem(Config.localStorageKey.templateTourCompleted) != "true") {
            localStorage.setItem(Config.localStorageKey.templateTourCompleted,"true")
            driverObj.drive()
        }
    }, [id]);

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
                        type


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
                        type
                        
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

        if(result.errors){
            console.error(result.errors)
            errorNotification({
                title: "Failed to load template data",
                tryAgainLater: true
            })
            return
        }

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
            errorNotification({
                title: "Failed to update template name",
                tryAgainLater: true
            })
            console.error(errors);
            return;
        }
    }

    const handleTemplateNameChange = (name: string) => {
        setQuery(current => ({
            ...current,
            data: {
                ...current.data,
                template: {
                    ...current.data.template,
                    name: name
                }
            }
        }))

        debounceUpdateTemplateName(name)
    }

    const debounceUpdateTemplateName = wuGeneral.debounce(updateTemplateName)

    const deleteTemplate = async () => {
        let decision = await confirm({
            title: 'Are you sure?',
            message: `Do you want to delete the template "${query.data.template?.name || "Unknown"}". No Shotlists will be affected by this action. This action cannot be undone.`,
            buttons: {
                confirm: {
                    text: 'Delete template',
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
            errorNotification({
                title: "Failed to delete template",
                tryAgainLater: true
            })
            console.error(errors);
            return;
        }

        successNotification({
            title: "Successfully deleted template",
            message: "Returning to the dashboard"
        })

        router.push("/dashboard");
    }

    function handleShotDefinitionDragEnd(event: any) {
        const {active, over} = event;

        if (active.id !== over.id && query.data.template && query.data.template.shotAttributes) {
            const oldIndex = query.data.template.shotAttributes.findIndex((definition) => definition!.id === active.id);
            const newIndex = query.data.template.shotAttributes.findIndex((definition) => definition!.id === over.id);

            client.mutate({
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
            }).then((result) => {
                if(result.errors){
                    errorNotification({
                        title: "Failed to move shot attribute definition",
                        tryAgainLater: true
                    })
                    console.error(result.errors)
                }
            })

            setQuery(current => ({
                ...current,
                data: {
                    ...current.data,
                    template:{
                        ...current.data.template,
                        shotAttributes: arrayMove(current.data.template?.shotAttributes || [], oldIndex, newIndex)
                    }
                }
            }))
        }
    }

    function onRemoveShotAttributeTemplate(id: number) {
        if(!query.data.template || !query.data.template.shotAttributes || query.data.template.shotAttributes.length == 0) return

        setQuery(current => {
            let newShotAttributes: AnyShotAttributeTemplate[] = []
            if(current.data.template?.shotAttributes){
                newShotAttributes = (current.data.template.shotAttributes as AnyShotAttributeTemplate[])
                    .filter((shotTemplate) => shotTemplate.id != id)
            }

            return {
                ...current,
                data: {
                    ...current.data,
                    template:{
                        ...current.data.template,
                        shotAttributes: newShotAttributes
                    }
                }
            }
        })
    }

    function handleSceneAttributeDragEnd(event: any) {
        const {active, over} = event;

        if (active.id !== over.id && query.data.template && query.data.template.sceneAttributes) {
            const oldIndex = query.data.template.sceneAttributes.findIndex((definition) => definition!.id === active.id);
            const newIndex = query.data.template.sceneAttributes.findIndex((definition) => definition!.id === over.id);

            client.mutate({
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
            }).then((result) => {
                if(result.errors){
                    errorNotification({
                        title: "Failed to move scene attribute definition",
                        tryAgainLater: true
                    })
                    console.error(result.errors)
                }
            })

            setQuery(current => ({
                ...current,
                data: {
                    ...current.data,
                    template:{
                        ...current.data.template,
                        sceneAttributes: arrayMove(current.data.template?.sceneAttributes || [], oldIndex, newIndex)
                    }
                }
            }))
        }
    }

    function onRemoveSceneAttributeTemplate(id: number) {
        if(!query.data.template || !query.data.template.sceneAttributes || query.data.template.sceneAttributes.length == 0) return

        setQuery(current => {
            let newSceneTemplates: AnyShotAttributeTemplate[] = []
            if(current.data.template?.sceneAttributes){
                newSceneTemplates = (current.data.template.sceneAttributes as AnyShotAttributeTemplate[])
                    .filter((sceneTemplate) => sceneTemplate.id != id)
            }

            return {
                ...current,
                data: {
                    ...current.data,
                    template:{
                        ...current.data.template,
                        sceneAttributes: newSceneTemplates
                    }
                }
            }
        })
    }

    if(query.errors && query.errors.length > 0) {
        switch (query.errors[0]?.extensions?.code as ShotlyErrorCode) {
            case ShotlyErrorCode.NOT_FOUND:
                return <main className="template dashboardContent">
                    <ErrorPage
                        title='404'
                        description='Sorry, we could not find the Template you were looking for. Please check the URL or return to the Dashboard.'
                    />
                </main>
            case ShotlyErrorCode.WRITE_NOT_ALLOWED:
            case ShotlyErrorCode.READ_NOT_ALLOWED:
                return <main className="template dashboardContent">
                    <ErrorPage
                        title='405'
                        description='Sorry, you are not allowed to access this Template. Please check the URL or return to the Dashboard.'
                    />
                </main>
        }
    }

    return (
        <main className={"template dashboardContent"}>
            <title>Shotly | Template</title>
            <div className="top">
                <h2>
                    {
                        query.loading ?
                        <Skeleton height="2rem"/> :
                        <>
                            <TextField
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
                                <Pencil
                                    size={18}
                                    style={{display: query.data.template?.name == "" ? "none" : "block"}}
                                />
                            </div>
                        </>
                    }
                </h2>

                <SimplePopover
                    content={
                        <p>
                            <span className="dark">Templates can be selected when creating a shotlist so that you don't have to create the same attributes over and over again.</span>
                            <br/>
                            <br/>
                            None of the changes made to this templated will be reflected in existing shotlists.
                            Every shotlist manages its own attributes, only those that are created based on this
                            template <i>after</i> it has been edited will use the updated attributes.
                            <br/>
                            <br/>
                            <Link href={"https://docs.shotly.at/templates"} target={"_blank"} className={"inline noPadding"}>Template Documentation</Link>
                        </p>
                    }
                    className={"noClickFx default infoTrigger"}
                    contentClassName={"popoverContent templateInfo"}
                    onOpen={() => td.signal("Template.InfoPopover") }
                >
                    <span>More on templates</span>
                    <Info size={18}/>
                </SimplePopover>

                <button className="delete bad" onClick={deleteTemplate}>
                    <span>Delete template</span>
                    <Trash size={18}/>
                </button>
            </div>

            <h3>Scene attributes</h3>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSceneAttributeDragEnd}
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
                                    <SceneAttributeTemplate
                                        attributeTemplate={attr}
                                        onDelete={onRemoveSceneAttributeTemplate}
                                        key={attr.id}
                                    />
                                )}
                            </div>)
                    }
                </SortableContext>
            </DndContext>

            <CreateSceneAttributeTemplatePopup
                setQuery={setQuery}
                templateId={id}
                isLoading={query.loading}
            />

            <h3>Shot attributes</h3>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleShotDefinitionDragEnd}
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
                                <ShotAttributeTemplate attributeTemplate={attr} onDelete={onRemoveShotAttributeTemplate}
                                                       key={attr.id}/>
                            )}
                        </div>)
                    }
                </SortableContext>
            </DndContext>

            <CreateShotAttributeTemplatePopup
                setQuery={setQuery}
                templateId={id}
                isLoading={query.loading}
            />

            {ConfirmDialog}
        </main>
    )
}