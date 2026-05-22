'use client';

import React, {useEffect, useRef, useState} from 'react';
import "./createTemplateDialog.scss"
import {useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {useRouter} from "next/navigation"
import TextField from "@/components/basic/textField/textField"
import Loader from "@/components/app/feedback/loader/loader"
import {errorNotification} from "@/service/NotificationService"
import Dialog, {DialogRef} from "@/components/basic/dialog/dialog"
import Config from "@/Config"

export function useCreateTemplateDialog() {
    const dialogElementRef = useRef<DialogRef>(null);

    const [name, setName] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)

    const enterPressed = useRef(handleConfirm)

    const router = useRouter()
    const client = useApolloClient()

    useEffect(() => {
        enterPressed.current = handleConfirm
    }, [name]);

    function open() {
        dialogElementRef.current?.open()
        setIsLoading(false)
        setName("")
    }

    function close() {
        dialogElementRef.current?.close()
    }

    async function handleConfirm() {
        if (name.length <= 2) {
            return;
        }
        setIsLoading(true)
        const {data, errors} = await client.mutate({
                mutation: gql`
                    mutation createTemplate($name: String!){
                        createTemplate(createDTO: {
                            name: $name
                        }){ id }
                    }`,
                variables: {name: name}
            },
        )

        if(errors){
            errorNotification({
                title: "Failed to create template",
                tryAgainLater: true
            })
            console.error(errors)
            return
        }

        router.push(`/dashboard/template/${data.createTemplate.id}`)
    }

    const Element = (
        <Dialog
            aria-describedby={"create template dialog"}
            contentClassName={"createTemplateDialogContent"}
            ref={dialogElementRef}
            keyBinds={{
                "Enter": () => enterPressed.current()
            }}
        >
            {isLoading ?
                <>
                    <h2 className={"title"}>Creating template "{name}"</h2>
                    <div className={"loading"}>
                        <Loader text={Config.loadingMessage.redirect}/>
                    </div>
                </>
                :
                <>
                    <h2 className={"title"}>Create Template</h2>
                    <TextField
                        label={"Name"}
                        valueChange={setName}
                        placeholder={"Personal Projects"}
                    />
                    <div className={"buttons"}>
                        <button onClick={e => {
                            e.stopPropagation();
                            close();
                        }}>cancel
                        </button>
                        <button disabled={name.length <= 2} onClick={e => {
                            e.stopPropagation();
                            handleConfirm();
                        }} className={"accent confirm"}>create
                        </button>
                    </div>
                </>
            }
        </Dialog>
    )

    return {
        open,
        close,
        Element
    }
}

