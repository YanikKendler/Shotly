"use client"

import React, {useContext, useEffect, useRef, useState} from "react"
import "./archive.scss"
import gql from "graphql-tag"
import {errorNotification, successNotification} from "@/service/NotificationService"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {Query, ShotlistDto} from "../../../../lib/graphql/generated"
import Utils from "@/utility/Utils"
import Skeleton from "react-loading-skeleton"
import DashboardGrid from "@/components/app/dashboard/dashboardGrid/dashboardGrid"
import DashboardGridShotlist from "@/components/app/dashboard/dashboardGridItem/dashboardGridShotlist"
import {Info} from "lucide-react"
import ErrorPage from "@/components/app/feedback/errorPage/errorPage"
import SimplePopover from "@/components/basic/popover/simplePopover"
import {DashboardContext} from "@/context/DashboardContext"

export default function Archive(){
    const client = useApolloClient()
    const dashboardContext = useContext(DashboardContext)

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        loadData()

        setInitialized(true)
    }, []);

    useEffect(() => {
        if(!initialized) return

        loadData()
            .then(() => {
                successNotification({
                    title: "Refreshed archived shotlists"
                })
            })
            .catch(() => {
                errorNotification({
                    title: "Failed to refresh archived shotlists",
                })
            })
    }, [dashboardContext.refreshSignal]);

    const loadData = async () => {
        setQuery(current => ({
            ...current,
            loading: true,
        }))

        const result = await client.query({query: gql`
            query archive{
                archivedShotlists {
                    personal {
                        id
                        name
                        sceneCount
                        shotCount
                        editedAt
                        owner {
                            name
                            email
                        }
                    }
                    shared {
                        id
                        name
                        sceneCount
                        shotCount
                        editedAt
                        owner {
                            name
                            email
                        }
                    }
                }
            }`,
            fetchPolicy: "no-cache"
        })

        if(result.errors){
            console.error(result.errors)
            errorNotification({
                title: "Failed to load archive data",
                tryAgainLater: true
            })
            return
        }

        setQuery(result)
    }

    if(query.errors || (!query.loading && !query.data.archivedShotlists)) return(
        <main className="archive dashboardContent">
            <ErrorPage
                title='Data could not be loaded'
                description={query.errors?.map(e => e.message).join(", ") || "Unknown error"}
                reload
                noLink
            />
        </main>
    )

    return (
        <main className={"archive dashboardContent"}>
            <title>Shotly | Archive</title>
            <div className="top">
                <h2>Archive</h2>
                <SimplePopover
                    content={
                        <p>
                            Archived shotlists can not be edited and are not displayed on the dashboard.
                            <br/>
                            <br/>
                            Shotlists can only be archived and unarchived by the shotlist owner.
                        </p>
                    }
                    fontSize={0.85}
                    className={"noClickFx default round"}
                >
                    <Info size={16}/>
                </SimplePopover>
            </div>
            {
                query.loading ?
                <>
                    <h3>My Shotlists</h3>
                    <DashboardGrid>
                        <Skeleton height={125}/>
                        <Skeleton height={125}/>
                    </DashboardGrid>
                    <h3>Shared</h3>
                    <DashboardGrid>
                        <Skeleton height={125}/>
                        <Skeleton height={125}/>
                    </DashboardGrid>
                </> :
                <>
                    {
                        //no results
                        (!query.data.archivedShotlists?.personal && !query.data.archivedShotlists?.shared) ||
                        //result list is empty
                        ((query.data.archivedShotlists?.personal?.length || 0) + (query.data.archivedShotlists?.shared?.length || 0) <= 0)
                        &&
                        <p className="empty">
                            Nothing here yet. <br/>
                            You can archive shotlists via the "Shotlist Options" modal.
                        </p>
                    }
                    {
                        query.data.archivedShotlists?.personal && query.data.archivedShotlists.personal.length > 0 &&
                        <>
                            <h3>My Shotlists</h3>
                            <DashboardGrid>
                                {(query.data.archivedShotlists.personal as ShotlistDto[]).map((shotlist: ShotlistDto) => (
                                    <DashboardGridShotlist shotlist={shotlist} key={shotlist.id}/>
                                ))}
                            </DashboardGrid>
                        </>
                    }
                    {
                        query.data.archivedShotlists?.shared && query.data.archivedShotlists.shared.length > 0 &&
                        <>
                            <h3>Shared</h3>
                            <DashboardGrid>
                                {(query.data.archivedShotlists.shared as ShotlistDto[]).map((shotlist: ShotlistDto) => (
                                    <DashboardGridShotlist shotlist={shotlist} key={shotlist.id}/>
                                ))}
                            </DashboardGrid>
                        </>
                    }
                </>
            }
        </main>
    )
}