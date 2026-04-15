"use client"

import React, {useEffect, useRef, useState} from "react"
import "./archive.scss"
import gql from "graphql-tag"
import {errorNotification, successNotification} from "@/service/NotificationService"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {Query, ShotlistDto} from "../../../../lib/graphql/generated"
import Utils from "@/util/Utils"
import Skeleton from "react-loading-skeleton"
import DashboardGrid from "@/components/dashboard/dashboardGrid/dashboardGrid"
import DashboardGridShotlist from "@/components/dashboard/dashboardGridItem/dashboardGridShotlist"
import {Info, Plus, RefreshCw} from "lucide-react"
import ErrorPage from "@/components/feedback/errorPage/errorPage"
import SimplePopover from "@/components/popover/simplePopover"
import Link from "next/link"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"
import {wuConstants} from "@yanikkendler/web-utils"

export default function Archive(){
    const client = useApolloClient()

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    const refreshButtonRef = useRef<HTMLButtonElement>(null)

    const [refreshBlocked, setRefreshBlocked] = useState(false)

    useEffect(() => {
        loadData()
    }, []);

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

    const refresh = () => {
        if(refreshBlocked) return

        setRefreshBlocked(true)

        loadData().then(() => {
            successNotification({
                title: "Refreshed archived shotlists."
            })
        })

        if(refreshButtonRef.current)
            refreshButtonRef.current.animate([
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(360deg)' }
            ], { duration: 300, iterations: 1 });

        setTimeout(() => {
            setRefreshBlocked(false)
        },wuConstants.Time.msPerSecond * 5)
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
                <SimpleTooltip text={refreshBlocked ? "please wait a few seconds" : "refresh"}>
                    <button
                        className={"default round right noClickFx"}
                        ref={refreshButtonRef}
                        onClick={refresh}
                        disabled={refreshBlocked}
                    >
                        <RefreshCw size={18}/>
                    </button>
                </SimpleTooltip>
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
                            You can archive shotlists via the "Shotlist options" modal.
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