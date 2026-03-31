'use client'

import Auth from "@/Auth"
import {useEffect, useState} from "react"

export default function AuthSwitcher({
    unauthenticated,
    authenticated,
    hasBeenAuthenticatedBefore
}:{
    unauthenticated: React.ReactElement,
    authenticated: React.ReactElement,
    hasBeenAuthenticatedBefore?: React.ReactElement
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasLoggedIn, setHasLoggedIn] = useState(false);

    useEffect(() => {
        setIsAuthenticated(Auth.isAuthenticated())
        setHasLoggedIn(Auth.hasLoggedInBefore())
    }, [])

    if(isAuthenticated) {
        return authenticated
    }

    if(hasBeenAuthenticatedBefore && hasLoggedIn) {
        return hasBeenAuthenticatedBefore
    }

    return unauthenticated
}