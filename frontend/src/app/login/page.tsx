
"use client"

import {useEffect} from "react"
import auth from "@/Auth"
import LoadingPage from "@/components/feedback/loadingPage/loadingPage"
import Config from "@/Config"

/**
 * User can be redirected here to trigger a new login eg. when their session has expired.
 * @constructor
 */
export default function LoginRedirectPage() {
    useEffect(() => {
        auth.login()
    }, []);

    return (
        <LoadingPage title={Config.loadingMessage.login}/>
    )
}