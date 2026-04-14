"use client"

import React, {useEffect, useState} from "react"
import "./archive.scss"
import gql from "graphql-tag"
import {errorNotification} from "@/service/NotificationService"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {Query, ShotlistDto} from "../../../../lib/graphql/generated"
import Utils from "@/util/Utils"
import Skeleton from "react-loading-skeleton"
import DashboardGrid from "@/components/dashboard/dashboardGrid/dashboardGrid"
import DashboardGridShotlist from "@/components/dashboard/dashboardGridItem/dashboardGridShotlist"
import {Info, Plus} from "lucide-react"
import ErrorPage from "@/components/feedback/errorPage/errorPage"
import SimplePopover from "@/components/popover/simplePopover"
import Link from "next/link"

export default function Archive(){
    const client = useApolloClient()

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)

    useEffect(() => {
        loadData()
    }, []);

    const loadData = async () => {
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
                        }
                    }
                }
            }`
        })

        if(result.errors){
            console.error(result.errors)
            errorNotification({
                title: "Failed to load archive data",
                tryAgainLater: true
            })
            return
        }

        console.log(result.data.archivedShotlists)

        setQuery(result)
    }

    if(query.errors || !query.data.archivedShotlists) return(
        <main className="archive dashboardContent">
            <ErrorPage
                title='Data could not be loaded'
                description={query.errors?.map(e => e.message).join(", ") || "Unknown error"}
                reload
                noLink
            />
        </main>
    )

    if(query.loading) return (
        <main className="archive dashboardContent">
            <h3>Shotlists</h3>
            <DashboardGrid>
                <Skeleton height={125}/>
                <Skeleton height={125}/>
            </DashboardGrid>
            <h3>Templates</h3>
            <DashboardGrid>
                <Skeleton height={125}/>
                <Skeleton height={125}/>
            </DashboardGrid>
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
                    <Info size={18}/>
                </SimplePopover>
            </div>
            <h3>Personal</h3>
            <DashboardGrid>
                {
                    !query.data.archivedShotlists.personal || query.data.archivedShotlists.personal.length == 0 ?
                        <p className="empty">Nothing here yet</p> :
                        (query.data.archivedShotlists.personal as ShotlistDto[]).map((shotlist: ShotlistDto) => (
                            <DashboardGridShotlist shotlist={shotlist} key={shotlist.id}/>
                        ))
                }
            </DashboardGrid>
            <h3>Shared</h3>
            <DashboardGrid>
                {
                    !query.data.archivedShotlists.shared || query.data.archivedShotlists.shared.length == 0 ?
                        <p className="empty">Nothing here yet</p> :
                        (query.data.archivedShotlists.shared as ShotlistDto[]).map((shotlist: ShotlistDto) => (
                            <DashboardGridShotlist shotlist={shotlist} key={shotlist.id}/>
                        ))
                }
            </DashboardGrid>
        </main>
    )
}