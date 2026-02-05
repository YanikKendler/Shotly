"use client"

import {useEffect} from "react"
import auth from "@/Auth"
import { useRouter } from 'next/navigation'
import LoadingPage from "@/components/feedback/loadingPage/loadingPage"
import Auth from "@/Auth"
import {td} from "@/service/Analytics"

/**
 * User is sent here after a login on the auth0 hosted login.shotly.at page
 * @constructor
 */
export default function CallbackPage() {
    const router = useRouter()

    useEffect(() => {
        auth.handleAuthentication()
            .then((targetUrl) => {
                td.signal("Callback.UserLogin")
                router.push(targetUrl)
            })
            .catch((error) => {
                console.error("Error during authentication:", error);
                Auth.logout()
            });
    }, []);

    return (
        <LoadingPage title={"Logging you in..."}/>
    )
}