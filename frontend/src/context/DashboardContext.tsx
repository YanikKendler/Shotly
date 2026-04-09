"use client";

import React, {createContext} from "react"
import {ApolloQueryResult} from "@apollo/client"
import {Query} from "../../lib/graphql/generated"
import Utils from "@/util/Utils"

export enum DialogStep {
    LOADING,
    PRO,
    TOUR,
    QUESTIONS
}

export const DashboardContext = createContext<{
    query: ApolloQueryResult<Query>
    setQuery: (query: ApolloQueryResult<Query>) => void,
    pendingCollaborations: ApolloQueryResult<Query>
    setPendingCollaborations: (query: ApolloQueryResult<Query>) => void,
    dialogStep: DialogStep,
    incrementDialogStep: (currentStep: DialogStep) => void,
}>({
    query: Utils.defaultQueryResult,
    setQuery: () => {},
    pendingCollaborations: Utils.defaultQueryResult,
    setPendingCollaborations: () => {},
    dialogStep: DialogStep.LOADING,
    incrementDialogStep: () => {}
})