"use client"

import {useEffect} from "react"
import auth from "@/Auth"
import { useRouter } from 'next/navigation'
import LoadingPage from "@/components/app/feedback/loadingPage/loadingPage"
import Analytics from "@/service/Analytics"
import Config from "@/Config"
import {wuConstants, wuText} from "@yanikkendler/web-utils/dist"

/**
 * User is sent here after a login on the auth0 hosted login.shotly.at page
 * @constructor
 */
export default function CallbackPage() {
    const router = useRouter()

    useEffect(() => {
        auth.handleAuthentication()
            .then((targetUrl) => {
                Analytics.signal("Callback.UserLogin")

                const returnToUrl = sessionStorage.getItem(Config.localStorageKey.returnToUrl)

                if(returnToUrl && !wuConstants.Regex.empty.test(returnToUrl)){
                    router.push(returnToUrl)
                    sessionStorage.removeItem(Config.localStorageKey.returnToUrl)
                }
                else{
                    router.push(targetUrl)
                }
            })
            .catch((error) => {
                console.error("Error during authentication:", error);
                auth.logout()
            });
    }, []);

    return (
        <LoadingPage/>
    )
}