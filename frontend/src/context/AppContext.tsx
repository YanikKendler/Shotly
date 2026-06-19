"use client";

import React, {createContext, ReactElement, ReactNode, useEffect, useState} from "react"
import {ApolloQueryResult} from "@apollo/client"
import {Query, UserDto} from "../../lib/graphql/generated"
import Utils from "@/utility/Utils"
import {usePathname} from "next/navigation"

export const AppContext = createContext<{
    page: string
    currentUser: UserDto | null
}>({
    page: "",
    currentUser: null
})

export const AppContextProvider = ({
    children
}:{
    children: ReactNode
}) => {
    const pathname = usePathname()

    const [page, setPage] = useState("")

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

    return <AppContext.Provider value={{
        page: page,
        currentUser: null
    }}>
        {children}
    </AppContext.Provider>
}