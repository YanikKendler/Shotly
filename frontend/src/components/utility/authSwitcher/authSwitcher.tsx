'use client'

import auth from "@/Auth"
import {ReactElement, useEffect, useState} from "react"

export default function AuthSwitcher({
    unauthenticated,
    authenticated,
}:{
    unauthenticated: ReactElement,
    authenticated: ReactElement,
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(auth.hasLoggedInBefore())
    }, [])

    if(isAuthenticated) {
        return authenticated
    }

    return unauthenticated
}