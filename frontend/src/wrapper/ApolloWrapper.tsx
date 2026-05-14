"use client";

import {from, HttpLink, split} from "@apollo/client";
import {ApolloClient, ApolloNextAppProvider, InMemoryCache,} from "@apollo/client-integration-nextjs";
import auth from "@/Auth"
import {setContext} from "@apollo/client/link/context"
import {onError} from "@apollo/client/link/error"
import Config from "@/Config"
import {ShotlyErrorCode} from "@/utility/Types"
import React from "react"
import {errorNotification} from "@/service/NotificationService"
import {GraphQLWsLink} from "@apollo/client/link/subscriptions"
import {createClient} from "graphql-ws"
import {getMainDefinition} from "@apollo/client/utilities"

export function makeClient() {
    const httpLink = new HttpLink({
        uri: Config.backendURL + "/graphql",
    })

    const wsLink = typeof window !== "undefined"
        ? new GraphQLWsLink(createClient({
            url: Config.backendURL.replace("http", "ws") + "/graphql",
            connectionParams: async () => {
                const token = auth.getIdToken();
                return {
                    authorization: token ? `Bearer ${token}` : "",
                };
            },
        }))
        : null;

    const authLink = setContext(async (_, {headers}) => {
        const token = auth.getIdToken()
        // return the headers to the context so httpLink can read them
        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : "",
            }
        }
    })

    const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            const error = graphQLErrors[0];

            if (error?.extensions?.type != 'SHOTLY_EXCEPTION') {
                console.error("unknown exception", error)
                /*errorNotification({
                    title: "unknown exception",
                    message: error.message,
                })*/
                //redirectToServerError()
            } else {
                switch (error?.extensions?.code as ShotlyErrorCode) {
                    case ShotlyErrorCode.ACCOUNT_DEACTIVATED:
                        if (window) {
                            window.location.href = '/userDeactivated'
                        }
                        break
                    case ShotlyErrorCode.TOO_MANY_REQUESTS:
                        errorNotification({
                            title: "You have been doing that a lot!",
                            tryAgainLater: true,
                            autoClose: true
                        })
                        break
                }
            }
        }
        if (networkError) {
            if (networkError.name === 'AbortError') {
                redirectToServerError()
            }

            if (networkError.message.includes("Failed to fetch") || (networkError as any).code === 'ECONNREFUSED') {
                redirectToServerError()
            }
        }
    })

    const httpChain = from([authLink, errorLink, httpLink]);

    let splitLink = httpChain

    //Redirect subscriptions to websocket link and other stuff to http chain
    if(typeof window !== "undefined" && wsLink)
        splitLink = split(
            ({ query }) => {
                const definition = getMainDefinition(query);
                return (
                    definition.kind === 'OperationDefinition' &&
                    definition.operation === 'subscription'
                )
            },
            wsLink,
            httpChain
        )

    return new ApolloClient({
        link: splitLink,
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: { errorPolicy: "all" },
            query: { errorPolicy: "all" },
            mutate: { errorPolicy: "all" },
        },
    })

    /*return new ApolloClient({
        link: from([authLink, errorLink, httpLink]),
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: {
                errorPolicy: "all",
            },
            query: {
                errorPolicy: "all",
            },
            mutate: {
                errorPolicy: "all",
            },
        },
    })*/
}

function redirectToServerError() {
    if (typeof window !== 'undefined') {
        window.location.replace('/serverError');
    }
}

export const apolloClient = makeClient();

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient}>
            {children}
        </ApolloNextAppProvider>
    );
}