import {
    Query,
    Scene,
    SceneAttributeDefinitionBase,
    SceneDto,
    ShotAttributeDefinitionBase,
    ShotDto,
    ShotlistDto
} from "../../../lib/graphql/generated"
import {BUILD_INFO} from "../../../buildinfo"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {errorNotification} from "@/service/NotificationService"

export interface JsonExport {
    version: string
    shotlyVersion: string
    date: string
    shotlist: ShotlistDto
}

export default function useJsonExport({
    generateFileName,
    shotlistId,
    filterData,
    setExportRunning
}:{
    generateFileName: () => string
    shotlistId: string | null
    filterData: (data: ApolloQueryResult<Query>) => ShotlistDto | null
    setExportRunning: (running: boolean) => void
}){
    const client = useApolloClient()

    const exportJson = async () => {
        setExportRunning(true)

        const result = await client.query({
            query: gql`
                query jsonExport($id: String!){
                    shotlist(id: $id) {
                        id
                        name
                        archived
                        createdAt
                        editedAt
                        template {
                            id,
                            name
                        }
                        scenes{
                            id
                            position
                            attributes{
                                id
                                definition{id,name}

                                ... on SceneSingleSelectAttributeDTO{
                                    singleSelectValue{id,name}
                                }

                                ... on SceneMultiSelectAttributeDTO{
                                    multiSelectValue{id,name}
                                }
                                ... on SceneTextAttributeDTO{
                                    textValue
                                }
                            }
                            shots {
                                id
                                position
                                attributes{
                                    id
                                    definition{id,name}

                                    ... on ShotSingleSelectAttributeDTO{
                                        singleSelectValue{id,name}
                                    }

                                    ... on ShotMultiSelectAttributeDTO{
                                        multiSelectValue{id,name}
                                    }
                                    ... on ShotTextAttributeDTO{
                                        textValue
                                    }
                                }
                                sceneId
                            }
                        }
                        sceneAttributeDefinitions{
                            id
                            name
                            position

                            ... on SceneSingleSelectAttributeDefinitionDTO{
                                options {
                                    id,
                                    name
                                }
                            }

                            ... on SceneMultiSelectAttributeDefinitionDTO{
                                options {
                                    id,
                                    name
                                }
                            }
                        }
                        shotAttributeDefinitions{
                            id
                            name
                            position
                            
                            ... on ShotSingleSelectAttributeDefinitionDTO{
                                options {
                                    id,
                                    name
                                }
                            }
                            
                            ... on ShotMultiSelectAttributeDefinitionDTO{
                                options {
                                    id,
                                    name
                                }
                            }
                        }
                        owner {
                            id,
                            email,
                            name
                        }
                        collaborations {
                            collaborationType,
                            collaborationState,
                            user {
                                id,
                                email,
                                name
                            }
                        }
                    }
                }`,
            variables: {id: shotlistId},
            fetchPolicy: "no-cache",
            context: {
                addTypename: false
            }
        })

        if(result.errors || result.error){
            errorNotification({
                title: "Export failed",
                message: "Could not load data for export.",
                tryAgainLater: true
            })
            setExportRunning(false)
            return
        }

        let shotlistData = filterData(result) as ShotlistDto

        shotlistData.scenes = (shotlistData.scenes as Scene[]).map(scene => ({
            ...scene,
            attributes: scene.attributes?.map(attribute => ({
                ...attribute,
                type: attribute!.__typename
            })),
            shots: scene.shots?.map(shot => ({
                ...shot,
                type: shot!.__typename
            }))
        })) as SceneDto[]

        shotlistData = {
            ...shotlistData,
            shotAttributeDefinitions: (shotlistData.shotAttributeDefinitions as ShotAttributeDefinitionBase[]).map(definition => ({
                ...definition,
                type: definition!.__typename
            })),
            sceneAttributeDefinitions: (shotlistData.sceneAttributeDefinitions as SceneAttributeDefinitionBase[]).map(definition => ({
                ...definition,
                type: definition!.__typename
            }))
        }

        const json: JsonExport = {
            version: "1.0.0",
            shotlyVersion: BUILD_INFO.version,
            date: new Date().toISOString(),
            shotlist: shotlistData
        }

        const omitTypename = (key: string, value: string) => (key === '__typename' ? undefined : value)
        const jsonString = JSON.stringify(json, omitTypename, 4)

        const blob = new Blob([jsonString], { type: "application/json" })
        const jsonObjectUrl = URL.createObjectURL(blob)

        const filename = generateFileName() + ".json"
        const anchorEl = document.createElement("a")
        anchorEl.href = jsonObjectUrl
        anchorEl.download = filename
        anchorEl.click()

        URL.revokeObjectURL(jsonObjectUrl)

        setTimeout(() => {
            setExportRunning(false)
        },2000)
    }

    return {exportJson}
}