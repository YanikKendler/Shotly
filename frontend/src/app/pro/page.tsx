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
import {Separator} from "radix-ui";
import ErrorPage from "@/components/feedback/errorPage/errorPage"

export default function Pro(){
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const client = useApolloClient();
    const router = useRouter();

    const [action, setAction] = useState({name: "Continue to Checkout", action: PaymentService.subscribeToPro})

    const [currentUser, setCurrentUser] = useState<UserDto | null>(null);

    useEffect(() => {
        if(!auth.isAuthenticated() || !auth.getUser()){
            router.replace('/')
            return
        }

        getUserDetails();
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if(!currentUser) return

        if(currentUser.tier !== UserTier.Basic || currentUser.hasCancelled == true){
            setAction({
                name: "Manage Subscription",
                action: PaymentService.manageSubscription
            })
        }
    }, [currentUser]);

    const getUserDetails = async () => {
        const result: ApolloQueryResult<Query> = await client.query({
            query: gql`
                query checkCurrentUserTier {
                    currentUser {
                        id
                        tier
                        hasCancelled
                    }
                }`,
            fetchPolicy: "no-cache"
        })

        if(result.error || !result.data.currentUser || !result.data.currentUser.id) {
            console.error("Error fetching current user:", result.error);
            router.push("/");
            Auth.logout();
            return
        }

        setCurrentUser(result.data.currentUser)
    }

    if(isLoading) return <LoadingPage title={"loading account data"}/>

    //TODO
    if(!currentUser || !currentUser.id || !currentUser.tier) return <ErrorPage title={"User not loaded"} description={""}/>

    //TODO multiple messages based on user tier
    if(currentUser.tier)
    return (
        <SimplePage>
            <h1>Thank you for choosing Shotly Pro!</h1>
            <p>You will get access to unlimited Shotlists and Collaborators.</p>
            <Separator.Root className="Separator horizontal" orientation="horizontal"/>
            <p className={"small"}>
                By proceeding, you agree to our <Link href={"/legal/termsOfUse"} className={"inline"}>Terms of Use</Link> and <Link href={"/legal/privacy"} className={"inline"}>Privacy Policy</Link>.
                <br/>
                Subscriptions renew automatically every month until canceled. You can cancel anytime in your account settings.
                We reserve the right to suspend or cancel subscriptions at our discretion, including for misuse or violation of our Terms of Use.
                <br/>
                Payments are securely processed by Stripe; we do not store credit card details.
                No refunds are provided for monthly plans. All prices shown include applicable taxes.
            </p>
            <div className="buttons">
                <Link className={"text"} href={"/dashboard"}>To your Dashboard</Link>
                <button className={"filled"} onClick={action.action}>{action.name}</button>
            </div>
        </SimplePage>
    );
}