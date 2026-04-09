'use client';

import React, {useEffect, useRef, useState} from 'react';
import "./createShotlistDialog.scss"
import {useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import TextField from "@/components//inputs/textField/textField"
import Loader from "@/components/feedback/loader/loader"
import {TemplateDto, UserDto, UserTier} from "../../../../lib/graphql/generated"
import SimpleSelect from "@/components/inputs/simpleSelect/simpleSelect"
import {SelectOption} from "@/util/Types"
import {useRouter} from "next/navigation"
import Link from "next/link"
import {errorNotification} from "@/service/NotificationService"
import Dialog, {DialogRef} from "@/components/dialog/dialog"
import Skeleton from "react-loading-skeleton"
import Config from "@/Config"

export function useCreateShotlistDialog() {
    const dialogElementRef = useRef<DialogRef>(null);

    const [promiseResolver, setPromiseResolver] = useState<(value: boolean) => void>();
    const [name, setName] = useState<string>("")
    const [isCreating, setIsCreating] = useState(false)
    const [templates, setTemplates] = useState<SelectOption[]>([{label: "No template", value: "null"}]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("null");
    const [currentUser, setCurrentUser] = useState<UserDto | null>(null);

    const enterPressed = useRef(handleConfirm)

    const router = useRouter()
    const client = useApolloClient()

    useEffect(() => {
        enterPressed.current = handleConfirm
    }, [name, isCreating, selectedTemplateId])

    async function loadData() {
        let {data, errors} = await client.query({
            query: gql`
                query createShotlistData {
                    templates {
                        id
                        name
                    }
                    currentUser {
                        tier
                        shotlistCount
                    }
                }
            `,
            fetchPolicy: "no-cache"
        })

        if(errors){
            errorNotification({
                title: "Failed to load creation data",
                tryAgainLater: true
            })
            console.error(errors)
            return
        }

        setCurrentUser(data.currentUser)

        const options: SelectOption[] = data.templates.map((template: TemplateDto) => ({
            label: template.name,
            value: template.id
        }))

        options.unshift({label: "No template", value: "null"})

        setTemplates(options)

        if(options.length > 1)
            setSelectedTemplateId(options[1].value)
    }

    function openCreateShotlistDialog(): Promise<boolean> {
        dialogElementRef.current?.open()
        setIsCreating(false)
        loadData()
        return new Promise((resolve) => {
            setPromiseResolver(() => resolve)
        })
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
            return
        }

        router.push(`/shotlist/${data.createShotlist.id}`)
        promiseResolver?.(true)
    }

    function handleCancel() {
        dialogElementRef.current?.close()
        promiseResolver?.(false)
    }

    let content: React.ReactElement

    if(!currentUser)
        content = <>
            <h2 className={"title center"}>Create Shotlist</h2>
            <Skeleton height={"2.5rem"}/>
            <Skeleton height={"2.5rem"}/>
            <div className="buttons">
                <Skeleton width={"10rem"} height={"2rem"}/>
                <Skeleton width={"10rem"} height={"2rem"}/>
            </div>
        </>
    else if(currentUser.tier == UserTier.Basic && currentUser.shotlistCount && currentUser.shotlistCount >= 1)
        content = <>
            <h2 className={"title center"}>Sorry, you have reached the maximum number of Shotlists.</h2>
            <p>Your account is on the basic tier, that means you are limited to a single shotlist. Please consider going Pro for 2.99€ / month.</p>
            <div className={"buttons"}>
                <button
                    onClick={e => {
                        e.stopPropagation();
                        handleCancel();
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
                options={templates}
                value={selectedTemplateId}
            />
            <div className={"buttons"}>
                <button onClick={e => {
                        e.stopPropagation();
                        handleCancel();
                    }}
                >
                    cancel
                </button>
                <button
                    disabled={name.length <= 2}
                    onClick={e => {
                        e.stopPropagation();
                        handleConfirm();
                    }}
                    className={"confirm"}
                >
                    create
                </button>
            </div>
        </>


    const CreateShotlistDialog = (
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

    return {openCreateShotlistDialog, CreateShotlistDialog};
}

