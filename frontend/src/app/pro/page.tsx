"use client";

import Auth from "@/Auth"
import auth from "@/Auth"
import "./pro.scss";
import {useEffect, useState} from "react"
import LoadingPage from "@/components/feedback/loadingPage/loadingPage"
import gql from "graphql-tag"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {useRouter} from "next/navigation"
import PaymentService from "@/service/PaymentService"
import SimplePage from "@/components/simplePage/simplePage"
import Link from "next/link"
import {Query, UserDto, UserTier} from "../../../lib/graphql/generated"
import ErrorPage from "@/components/feedback/errorPage/errorPage"
import Config from "@/Config"
import Separator from "@/components/separator/separator"
import {wuTime} from "@yanikkendler/web-utils"
import {errorNotification} from "@/service/NotificationService"

export default function Pro(){
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const client = useApolloClient();
    const router = useRouter();

    const [currentUser, setCurrentUser] = useState<UserDto | null>(null);

    useEffect(() => {
        if(!auth.isAuthenticated()){
            router.replace('/login')
            return
        }

        if(!auth.getUser()) return

        getCurrentUser();
    }, []);

    useEffect(() => {
        if(!currentUser) return
    }, [currentUser]);

    const getCurrentUser = async () => {
        const result: ApolloQueryResult<Query> = await client.query({
            query: gql`
                query checkCurrentUserTier {
                    currentUser {
                        id
                        tier
                        hasCancelled
                        revokeProAfter
                    }
                }`,
            fetchPolicy: "no-cache"
        })

        if(result.error || !result.data.currentUser || !result.data.currentUser.id) {
            errorNotification({
                title: "Failed to load user data",
                tryAgainLater: true
            })
            console.error("Error fetching current user:", result.error);
            router.push("/");
            Auth.logout();
            return
        }

        setCurrentUser(result.data.currentUser)

        setIsLoading(false);
    }

    if(isLoading || !auth.getUser()) return <LoadingPage title={Config.loadingMessage.authGetUser}/>

    let content;

    if(!currentUser || !currentUser.id || !currentUser.tier) return (
        <ErrorPage
            title={"User could not be loaded"}
            description={"Please try again later."}
            reload
            noLink
        />
    )

    else if(currentUser.tier == UserTier.Pro)
        content = (
            <>
                <h1>You already own Shotly Pro!</h1>
                <p>
                    I hope you are enjoying Shotly, if you run into any issues or have a feature request, feel free to reach out to <Link className={"noPadding inline"} href={"mailto:yanik@shotly.at"}>yanik@shotly.at</Link> or <Link className={"noPadding inline"} href={"https://github.com/YanikKendler/shotly/issues/new/choose"}>create a new Issue on GitHub</Link>.
                </p>
                <p>Thank you for supporting my work :D</p>

                <div className="buttons">
                    <button className={"text"} onClick={PaymentService.manageSubscription}>Manage Subscription</button>
                    <Link className={"filled"} href={"/dashboard"}>To your Dashboard</Link>
                </div>
            </>
        )
    else if(currentUser.tier == UserTier.ProStudent)
        content = (
            <>
                <h1>You already own Shotly Pro for Free!</h1>
                <p>Since you are a student living off student money and stuff :D</p>
                <p>Lets hope you are not american.. then you would be living off student debt :(</p>
                <br/>
                <p>Your pro subscription will be revoked after {wuTime.toDateString(currentUser.revokeProAfter) || "unkown"}.</p>

                <div className="buttons">
                    <Link className={"filled"} href={"/dashboard"}>To your Dashboard</Link>
                </div>
            </>
        )
    else if(currentUser.tier == UserTier.ProFree)
        content = (
            <>
                <h1>You already own Shotly Pro for Free!</h1>
                <p>Since you are a friend.. or you hacked the server and decided to give yourself pro. In that case I will take that as a compliment but please do send me an email.</p>
                <p>Aaaanyways, if you are in fact a friend - have fun mate!</p>
                <br/>
                {
                    currentUser.revokeProAfter &&
                    <p>Your pro subscription will be revoked after {wuTime.toDateString(currentUser.revokeProAfter) || "unkown"}.</p>
                }

                <div className="buttons">
                    <Link className={"filled"} href={"/dashboard"}>To your Dashboard</Link>
                </div>
            </>
        )
    else {
        if (currentUser.hasCancelled == true)
            content = (
                <>
                    <h1>Thank you for choosing Shotly Pro!</h1>
                    <p>You will regain access to <span>unlimited Shotlists</span> and <span>unlimited Collaborators</span>.
                    </p>
                    <p>All of your existing shotlists will no longer be read-only!</p>
                    <div className="buttons">
                        <Link className={"text"} href={"/dashboard"}>Cancel</Link>
                        <button className={"filled"} onClick={PaymentService.subscribeToPro}>Continue to Checkout
                        </button>
                    </div>
                    <Separator/>
                    <p className={"small"}>
                        By proceeding, you agree to our <Link href={"/legal/termsOfUse"} className={"inline"}>Terms of
                        Use</Link> and <Link href={"/legal/privacy"} className={"inline"}>Privacy Policy</Link>.
                        <br/>
                        Subscriptions renew automatically every month until canceled. You can cancel anytime in your
                        account settings.
                        We reserve the right to suspend or cancel subscriptions at our discretion, including for misuse
                        or violation of our Terms of Use.
                        <br/>
                        Payments are securely processed by Stripe; we do not store credit card details.
                        No refunds are provided for monthly plans. All prices shown include applicable taxes.
                    </p>
                </>
            )
        else
            content = (
                <>
                    <h1>Thank you for choosing Shotly Pro!</h1>
                    <p>You will get access to <span>unlimited Shotlists</span> and <span>unlimited Collaborators</span> for <span>2.99€</span>/month.
                    </p>
                    <p>And thanks for supporting my work :D</p>
                    <div className="buttons">
                        <Link className={"text"} href={"/dashboard"}>Cancel</Link>
                        <button className={"filled"} onClick={PaymentService.subscribeToPro}>Continue to Checkout</button>
                    </div>
                    <Separator/>
                    <p className={"small"}>
                        By proceeding, you agree to our <Link href={"/legal/termsOfUse"} className={"inline"}>Terms of
                        Use</Link> and <Link href={"/legal/privacy"} className={"inline"}>Privacy Policy</Link>.
                        <br/>
                        Subscriptions renew automatically every month until canceled. You can cancel anytime in your
                        account settings.
                        We reserve the right to suspend or cancel subscriptions at our discretion, including for misuse
                        or violation of our Terms of Use.
                        <br/>
                        Payments are securely processed by Stripe; we do not store credit card details.
                        No refunds are provided for monthly plans. All prices shown include applicable taxes.
                    </p>
                </>
            )

        return (
            <SimplePage className={"pro"}>
                <title>Shotly | Pro</title>
                {content}
            </SimplePage>
        )
    }
}