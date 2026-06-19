"use client";

import React, {createContext, Dispatch, ReactNode, RefObject, SetStateAction, useEffect, useRef, useState} from "react"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {Query, UserDto} from "../../lib/graphql/generated"
import {usePathname} from "next/navigation"
import gql from "graphql-tag"
import {errorNotification, infoNotification} from "@/service/NotificationService"
import auth from "@/Auth"
import LoadingPage from "@/components/app/feedback/loadingPage/loadingPage"

export interface VisibleOverlay{
    close: () => void,
    usingKeybinds?: string[]
}

export const AppContext = createContext<{
    page: string
    currentUser: UserDto | null
    currentUserReloading: boolean
    reloadCurrentUser: () => void
    setCurrentUser: Dispatch<SetStateAction<UserDto | null>>
    visibleOverlays: RefObject<Map<string, VisibleOverlay>>
    isKeybindBlocked: (keybind: string) => boolean,
    closeOverlays: () => void
}>({
    page: "",
    currentUser: null,
    currentUserReloading: true,
    reloadCurrentUser: () => {},
    setCurrentUser: () => {},
    visibleOverlays: {current: new Map()},
    isKeybindBlocked: () => false,
    closeOverlays: () => {},
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
    const visibleOverlays = useRef(new Map<string, VisibleOverlay>())

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

    useEffect(() => {
        visibleOverlays.current.clear()
    }, [page]);

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

    const isKeybindBlocked = (keybind: string) => {
        const anyOverlayOpen = visibleOverlays.current.size > 0

        //Check if the pressed keybind is being overwritten by the overlay, if not - show a notification
        const currentKeyBindInUse = visibleOverlays.current.values().some(b => b.usingKeybinds?.includes(keybind))
        if(!currentKeyBindInUse) {
            infoNotification({
                title: "This keybind is paused",
                message: "Close the current overlay to use it [Esc]"
            })
        }

        return anyOverlayOpen
    }

    const closeOverlays = () => {
        visibleOverlays.current.forEach(overlay => overlay.close())
    }

    return <AppContext.Provider value={{
        page: page,
        currentUser: currentUser,
        currentUserReloading: reloading,
        reloadCurrentUser: loadData,
        setCurrentUser: setCurrentUser,
        visibleOverlays: visibleOverlays,
        isKeybindBlocked: isKeybindBlocked,
        closeOverlays: closeOverlays
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