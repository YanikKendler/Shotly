"use client";

import React, {createContext} from "react"
import {ApolloQueryResult} from "@apollo/client"
import {Query} from "../../lib/graphql/generated"
import Utils from "@/util/Utils"

export enum DialogStep {
    LOADING,
    NAME,
    PRO,
    TOUR,
    HOW_DID_YOU_HEAR,
    FINISHED
}

export const DashboardContext = createContext<{
    query: ApolloQueryResult<Query>
    setQuery: (query: ApolloQueryResult<Query>) => void,
    pendingCollaborations: ApolloQueryResult<Query>
    setPendingCollaborations: (query: ApolloQueryResult<Query>) => void,
    dialogStep: DialogStep,
    incrementDialogStep: () => void,
}>({
    query: Utils.defaultQueryResult,
    setQuery: () => {},
    pendingCollaborations: Utils.defaultQueryResult,
    setPendingCollaborations: () => {},
    dialogStep: DialogStep.LOADING,
    incrementDialogStep: () => {}
})