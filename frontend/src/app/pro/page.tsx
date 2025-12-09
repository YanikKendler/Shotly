"use client";

import Auth from "@/Auth"
import "./pro.scss";
import {use, useEffect, useState} from "react"
import LoadingPage from "@/components/feedback/loadingPage/loadingPage"
import gql from "graphql-tag"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {useRouter} from "next/navigation"
import PaymentService from "@/service/PaymentService"
import SimplePage from "@/components/simplePage/simplePage"
import auth from "@/Auth"
import Link from "next/link"
import {Query, UserDto} from "../../../lib/graphql/generated"
import { Separator } from "radix-ui";

export default function Pro(){
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const client = useApolloClient();
    const router = useRouter();

    const [action, setAction] = useState({name: "Continue to Checkout", action: PaymentService.subscribeToPro})

    const [userDetails, setUserDetails] = useState<UserDto | null>(null);

    useEffect(() => {
        if(!auth.isAuthenticated() || !auth.getUser()){
            router.replace('/')
            return
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        if(!userDetails) return

        if(userDetails.tier !== "BASIC" || userDetails.hasCancelled == true){
            setAction({
                name: "Manage Subscription",
                action: PaymentService.manageSubscription
            })
        }
    }, [userDetails]);

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

        setUserDetails(result.data.currentUser)
    }

    if(isLoading) return <LoadingPage title={"loading account data"}/>

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