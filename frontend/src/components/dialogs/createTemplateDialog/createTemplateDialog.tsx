'use client';

import * as Dialog from '@radix-ui/react-dialog';
import React, { useState} from 'react';
import "./createTemplateDialog.scss"
import {useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import auth from "@/Auth"
import {useRouter} from "next/navigation"
import TextField from "@/components//inputs/textField/textField"
import Loader from "@/components/feedback/loader/loader"

export function useCreateTemplateDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [promiseResolver, setPromiseResolver] = useState<(value: boolean) => void>();
    const [name, setName] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const client = useApolloClient()

    function openCreateTemplateDialog(): Promise<boolean> {
        setIsOpen(true)
        setIsLoading(false)
        setName("")
        return new Promise((resolve) => {
            setPromiseResolver(() => resolve);
        })
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
        router.push(`/dashboard/template/${data.createTemplate.id}`)
        promiseResolver?.(true)
    }

    function handleCancel() {
        setIsOpen(false)
        promiseResolver?.(false)
    }

    const CreateTemplateDialog = (
        <Dialog.Root open={isOpen || isLoading} onOpenChange={setIsOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className={"createTemplateDialogOverlay dialogOverlay"}/>
                <Dialog.Content
                    aria-describedby={"confirm action dialog"}
                    className={"createTemplateDialogContent dialogContent"}
                    onKeyDown={(e) => {
                        if(e.key === "Enter" && !isLoading) {
                            e.preventDefault()
                            handleConfirm()
                        }
                    }}
                >
                    {isLoading ?
                        <>
                            <Dialog.Title className={"title"}>Creating template "{name}"</Dialog.Title>
                            <div className={"loading"}>
                                <Loader/>
                                <p>You will be redirected shortly</p>
                            </div>
                        </>
                        :
                        <>
                            <Dialog.Title className={"title"}>Create Template</Dialog.Title>
                            <TextField
                                label={"Name"}
                                valueChange={setName}
                                placeholder={"Personal Projects"}
                            />
                            <div className={"buttons"}>
                                <button onClick={e => {
                                    e.stopPropagation();
                                    handleCancel();
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
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );

    return {openCreateTemplateDialog, CreateTemplateDialog};
}

