'use client';

import React, {useContext, useEffect, useRef, useState} from 'react';
import "./createShotlistDialog.scss"
import {useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import TextField from "@/components/basic/textField/textField"
import Loader from "@/components/app/feedback/loader/loader"
import {Template, TemplateDto, UserDto, UserTier} from "../../../../../lib/graphql/generated"
import SimpleSelect from "@/components/basic/simpleSelect/simpleSelect"
import {SelectOption} from "@/utility/Types"
import {useRouter} from "next/navigation"
import Link from "next/link"
import {errorNotification} from "@/service/NotificationService"
import Dialog, {DialogRef} from "@/components/basic/dialog/dialog"
import Skeleton from "react-loading-skeleton"
import Config from "@/Config"
import {AppContext} from "@/context/AppContext"
import Utils from "@/utility/Utils"

export function useCreateShotlistDialog() {
    const dialogElementRef = useRef<DialogRef>(null);

    const [name, setName] = useState<string>("")
    const [isCreating, setIsCreating] = useState(false)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("null");

    const enterPressed = useRef(handleConfirm)

    const router = useRouter()
    const client = useApolloClient()
    const appContext = useContext(AppContext)

    useEffect(() => {
        enterPressed.current = handleConfirm
    }, [name, isCreating, selectedTemplateId])

    function open() {
        dialogElementRef.current?.open()
        setIsCreating(false)
        appContext.reloadCurrentUser()
    }

    function close() {
        dialogElementRef.current?.close()
    }

    async function handleConfirm() {
        if (name.length <= 2 || isCreating) {
            return
        }

        setIsCreating(true)

        let templateId = selectedTemplateId === "null" ? null : selectedTemplateId;

        const {data, errors} = await client.mutate({
                mutation: gql`
                    mutation createShotlist($name: String!, $templateId: String) {
                        createShotlist(createDTO: {
                            name: $name
                            templateId: $templateId
                        }){ id }
                    }`,
                variables: {name: name, templateId: templateId}
            },
        )

        if(errors){
            errorNotification({
                title: "Failed to create shotlist",
                tryAgainLater: true
            })
            console.error(errors)
            dialogElementRef.current?.close()
            return
        }

        router.push(`/shotlist/${data.createShotlist.id}`)
    }

    let content: React.ReactElement

    if(appContext.currentUserReloading)
        content = <>
            <h2 className={"title center"}>Create Shotlist</h2>
            <Skeleton height={"2.5rem"}/>
            <Skeleton height={"2.5rem"}/>
            <div className="buttons">
                <Skeleton width={"10rem"} height={"2rem"}/>
                <Skeleton width={"10rem"} height={"2rem"}/>
            </div>
        </>
    else if(
        !Utils.userIsPro(appContext.currentUser) &&
        appContext.currentUser?.shotlistCount &&
        appContext.currentUser?.shotlistCount >= 1
    )
        content = <>
            <h2 className={"title center"}>Sorry, you have reached the maximum number of Shotlists.</h2>
            <p>Your account is on the basic tier, that means you are limited to a single shotlist. Please consider going Pro for 2.99€ / month.</p>
            <div className={"buttons"}>
                <button
                    onClick={e => {
                        e.stopPropagation();
                        close();
                    }}
                >
                    cancel
                </button>
                <Link className={"accent confirm"} href="/pro">Choose Pro</Link>
            </div>
        </>
    else if (isCreating)
        content = <>
            <h2 className={"title center"}>Creating shotlist "{name}"</h2>
            <div className={"loading"}>
                <Loader text={Config.loadingMessage.redirect}/>
            </div>
        </>
    else
        content = <>
            <h2 className={"title"}>Create Shotlist</h2>
            <TextField
                label={"Name"}
                valueChange={setName}
                placeholder={"Interstellar"}
            />
            <SimpleSelect
                label={"Template"}
                name={"Template"}
                onChange={setSelectedTemplateId}
                options={[
                    {label: "No template", value: "null"},
                    ...(appContext.currentUser?.templates as Template[])?.map((template: Template) => ({
                        label: template.name || "Unnamed",
                        value: template.id || "Unknown"
                    }))
                ]}
                value={selectedTemplateId}
            />
            <div className={"buttons"}>
                <button onClick={e => {
                        e.stopPropagation();
                        close();
                    }}
                >
                    Cancel
                </button>
                <button
                    disabled={name.length <= 2}
                    onClick={e => {
                        e.stopPropagation();
                        handleConfirm();
                    }}
                    className={"confirm"}
                >
                    Create
                </button>
            </div>
        </>


    const Element = (
        <Dialog
            aria-describedby={"create shotlist dialog"}
            contentClassName={"createShotlistDialogContent"}
            ref={dialogElementRef}
            keyBinds={{
                "Enter": () => enterPressed.current()
            }}
        >
            {content}
        </Dialog>
    );

    return {
        open,
        close,
        Element
    };
}

