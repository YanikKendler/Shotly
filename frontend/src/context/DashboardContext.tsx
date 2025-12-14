"use client";

import {createContext, RefObject} from "react"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import {SelectOption} from "@/util/Types"
import {ApolloQueryResult} from "@apollo/client"
import {Query} from "../../lib/graphql/generated"
import Utils from "@/util/Utils"

export const DashboardContext = createContext<{
    query: ApolloQueryResult<Query>
    setQuery: (query: ApolloQueryResult<Query>) => void,
    pendingCollaborations: ApolloQueryResult<Query>
    setPendingCollaborations: (query: ApolloQueryResult<Query>) => void
}>({
    query: Utils.defaultQueryResult,
    setQuery: () => {},
    pendingCollaborations: Utils.defaultQueryResult,
    setPendingCollaborations: () => {}
})