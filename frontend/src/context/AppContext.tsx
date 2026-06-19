"use client";

import React, {createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState} from "react"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {Query, UserDto} from "../../lib/graphql/generated"
import {usePathname} from "next/navigation"
import gql from "graphql-tag"
import {errorNotification} from "@/service/NotificationService"
import auth from "@/Auth"
import Utils from "@/utility/Utils"
import LoadingPage from "@/components/app/feedback/loadingPage/loadingPage"

export const AppContext = createContext<{
    page: string
    currentUser: UserDto | null
    currentUserReloading: boolean
    reloadCurrentUser: () => void
    setCurrentUser: Dispatch<SetStateAction<UserDto | null>>
}>({
    page: "",
    currentUser: null,
    currentUserReloading: true,
    reloadCurrentUser: () => {},
    setCurrentUser: () => {},
})

export const AppContextProvider = ({
    children
}:{
    children: ReactNode
}) => {
    const pathname = usePathname()
    const client = useApolloClient()

    const [page, setPage] = useState("")
    const [currentUser, setCurrentUser] = useState<UserDto | null>(null)

    const [initialLoadComplete, setInitialLoadComplete] = useState(false)
    const [reloading, setReloading] = useState(false)

    useEffect(() => {
        if(!auth.isAuthenticated()){
            auth.login(pathname)
            return
        }

        if(auth.getUser())
            loadData()
    }, []);

    useEffect(() => {
        const cleanPath = pathname.replace(/^\//, '');
        const splitPath = cleanPath.split('?')[0].split("/")

        if(splitPath[0] == "dashboard"){
            if(splitPath.length > 1)
                setPage(splitPath[1])
            else
                setPage(splitPath[0])
        }
        else {
            setPage(splitPath[0])
        }
    }, [pathname])

    const loadData = async () => {
        setReloading(true)

        const result: ApolloQueryResult<Query> = await client.query({
            query: gql`
                query app{
                    currentUser {
                        id
                        name
                        email
                        howDidYouHearReason
                        createdAt
                        tier
                        hasCancelled
                        revokeProAfter
                        shotlists {
                            id
                            name
                        }
                        templates {
                            id
                            name
                        }
                        revokeProAfter
                        blockedUsers {
                            id
                            name
                            email
                        }
                    }
                }
            `,
        })

        if(result.errors) {
            errorNotification({
                message: "Failed to application data.",
                tryAgainLater: true,
            })
        }

        setCurrentUser(result.data.currentUser ?? null)
        setReloading(false)
        setInitialLoadComplete(true)
    }

    return <AppContext.Provider value={{
        page: page,
        currentUser: currentUser,
        currentUserReloading: reloading,
        reloadCurrentUser: loadData,
        setCurrentUser: setCurrentUser
    }}>
        {
            initialLoadComplete
                ?
            children
                :
            <LoadingPage/>
        }
    </AppContext.Provider>
}