import {CollaborationDto, Query, ShotlistDto, UserMinimalDto} from "../../../lib/graphql/generated"
import {BUILD_INFO} from "../../../buildinfo"
import {useContext} from "react"
import {ShotlistContext} from "@/context/ShotlistContext"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {errorNotification} from "@/service/NotificationService"

export interface JsonExport {
    version: string
    shotlyVersion: string
    timestamp: number
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
                                definition{id}

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
                                    definition{id}

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
            fetchPolicy: "no-cache"
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

        const json: JsonExport = {
            version: "1.0.0",
            shotlyVersion: BUILD_INFO.version,
            timestamp: Date.now(),
            shotlist: filterData(result) as ShotlistDto
        }

        const jsonString = JSON.stringify(json, null, 4)

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