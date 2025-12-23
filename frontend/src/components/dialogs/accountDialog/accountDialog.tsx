'use client';

import * as Dialog from '@radix-ui/react-dialog';
import React, {useContext, useEffect, useState} from 'react';
import "./accountDialog.scss"
import {useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {Monitor, Moon, Sun, X} from "lucide-react"
import Auth from "@/Auth"
import {User, UserDto, UserTier} from "../../../../lib/graphql/generated"
import {RadioGroup, Separator, Switch, VisuallyHidden} from "radix-ui"
import TextField from "@/components/inputs/textField/textField"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialoge"
import Loader from "@/components/feedback/loader/loader"
import {NotificationContext} from "@/context/NotificationContext"
import Link from "next/link"
import PaymentService from "@/service/PaymentService"
import Config from "@/util/Config"
import Skeleton from "react-loading-skeleton"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import Slider from "@/components/inputs/slider/slider"
import {BUILD_INFO} from "../../../../buildinfo"

export interface UserSettings {
    saveExportSettingsInLocalstorage: boolean
    displaySceneNumbersNextToShotNumbers: boolean
    shotNumberingAfterZ: "different" | "repeating"
    shotlistScale: number
}

export function useAccountDialog() {
    const client = useApolloClient()
    const {confirm, ConfirmDialog} = useConfirmDialog()
    const notificationContext = useContext(NotificationContext)

    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<UserDto | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [passwordResetDisabled, setPasswordResetDisabled] = useState(false);

    const [selectedAppearance, setSelectedAppearance] = useState<string>("system");
    const [userSettings, setUserSettings] = useState<UserSettings>({
        saveExportSettingsInLocalstorage: true,
        displaySceneNumbersNextToShotNumbers: false,
        shotNumberingAfterZ: "repeating",
        shotlistScale: 1,
    })

    const [settingsLoaded, setSettingsLoaded] = useState(false)
    
    useEffect(() => {
        setSelectedAppearance(localStorage.getItem(Config.localStorageKey.theme) || "system")

        const userSettingsString = localStorage.getItem(Config.localStorageKey.userSettings)
        if(userSettingsString != null) {
            const newSettings = JSON.parse(userSettingsString) as UserSettings
            setUserSettings(newSettings)
            document.documentElement.style.setProperty("--shotlist-scale", newSettings.shotlistScale?.toString() || "1");
        }
        else{
            //nothing in localstorage currently, so write the default settings
            writeSettingsToLocalStorage()
            document.documentElement.style.setProperty("--shotlist-scale", "1");
        }

        setSettingsLoaded(true)
    }, [])

    /**
     * this is handled individually and not with the other settings
     * because the appearance is applied and loaded in the root layout before anything else so that there is no flashing
     * @param value
     */
    useEffect(() => {
        localStorage.setItem(Config.localStorageKey.theme, selectedAppearance)

        switch (selectedAppearance) {
            case "light":
            case "dark":
                document.documentElement.setAttribute("data-theme", selectedAppearance)
                break
            case "system":
                const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                document.documentElement.setAttribute('data-theme', systemPref)
                break
        }
    }, [selectedAppearance])

    useEffect(() => {
        if(settingsLoaded == false) return

        writeSettingsToLocalStorage()
    }, [userSettings])

    const writeSettingsToLocalStorage = () => {
        const userSettingsString = JSON.stringify(userSettings)
        localStorage.setItem(Config.localStorageKey.userSettings, userSettingsString)
    }

    function openAccountDialog() {
        setIsOpen(true)
        getCurrentUser()
    }

    async function getCurrentUser(){
        const {data, error} = await client.query({
            query: gql`
                query currentUser{
                    currentUser {
                        id
                        name
                        email
                        createdAt
                        tier
                        hasCancelled
                        shotlists {
                            name
                        }
                    }
                }`,
            fetchPolicy: "no-cache"
        })

        if(error) {
            console.error("Error fetching current user:", error)
            return
        }

        setUser(data.currentUser)
    }

    async function resetPassword() {
        setPasswordResetDisabled(true);

        const {data, errors} = await client.mutate({
                mutation: gql`
                    mutation triggerPasswordReset {
                        triggerPasswordReset
                    }`
            },
        )

        if(errors) {
            console.error("Error resetting password:", errors);
            setPasswordResetDisabled(false)
            return;
        }

        notificationContext.notify({
            title: "Password reset request sent",
            message: `Please check your email: "${user?.email}" for a link to reset your password.`,
        })

        setTimeout(() => {
            setPasswordResetDisabled(false)
        },10000)
    }

    async function deleteAccount() {
        let decision = await confirm({
            title: "Are you sure?",
            message: `This will delete your account and all associated data. The following shotlist(s) will be deleted: ${user?.shotlists?.map(s => `"${s!.name}"`).join(", ")}. This action cannot be undone.`,
            checkbox: true,
            buttons: {
                confirm: {
                    className: "bad",
                }
            }
        })

        if(!decision) return

        setDeleting(true)

        const {data, errors} = await client.mutate({
                mutation: gql`
                    mutation deleteUser{
                        deleteUser {
                            id
                        }
                    }`
            },
        )

        if(errors) {
            console.error("Error deleting account:", errors);
            return;
        }

        Auth.logout();
    }

    const updateUserName = async (name: string) => {
        if(wuConstants.Regex.empty.test(name)) return

        const {data, errors} = await client.mutate({
                mutation: gql`
                    mutation updateUser($name: String!){
                        updateUser(editDTO: {
                            name: $name
                        }) {
                            id
                            name
                        }
                    }`,
                variables: {name: name.trim()},
            },
        )

        if(errors) {
            console.error("Error deleting account:", errors);
            return;
        }
    }

    let dialogContent

    if(deleting)
        dialogContent = <Loader text={"loading user"}/>
    else
        dialogContent = (
            <>
                <TextField
                    label={"email"}
                    value={user?.email || "unknown"}
                    disabled={true}
                />

                <TextField
                    label={"display name"}
                    value={user?.name || "unknown"}
                    info={"This a publicly visible name used for collaboration with others. You cannot use it to log in."}
                    maxLength={50}
                    placeholder={"John Doe"}
                    valueChange={updateUserName}
                    debounceValueChange={true}
                />

                { !Auth.getUser()?.isSocial &&
                    <div className="row">
                        <p>Send password reset request to your email</p>
                        <button disabled={passwordResetDisabled} className={"logout"} onClick={resetPassword}>send email
                        </button>
                    </div>
                }

                <div className="row">
                    <p>Subscription</p>
                    {
                        user?.tier != UserTier.Basic ?
                        <button onClick={PaymentService.manageSubscription}>Manage subscription</button> :
                        user?.hasCancelled === true ?
                        <button onClick={PaymentService.manageSubscription}>Renew subscription</button> :
                        <a className={"accent"} href={"/pro"}>Upgrade to Pro</a>
                    }
                </div>


                <Separator.Root className={"Separator"}/>

                <div className="row">
                    <p>Appearance</p>
                    <RadioGroup.Root
                        className="RadioGroupRoot"
                        defaultValue={selectedAppearance}
                        aria-label="Appearance"
                        onValueChange={setSelectedAppearance}
                    >
                        <RadioGroup.Item className="RadioGroupItem" value="light">
                            <Sun size={20}/>
                        </RadioGroup.Item>
                        <RadioGroup.Item className="RadioGroupItem" value="dark">
                            <Moon size={20}/>
                        </RadioGroup.Item>
                        <RadioGroup.Item className="RadioGroupItem" value="system">
                            <Monitor size={20}/>
                        </RadioGroup.Item>
                    </RadioGroup.Root>
                </div>

                {   settingsLoaded == false ?
                    <Skeleton count={3} height={"30px"}/> :
                    <>
                        <div className="row">
                            <p>Remember export settings between reloads</p>
                            <Switch.Root
                                className="SwitchRoot"
                                checked={userSettings.saveExportSettingsInLocalstorage}
                                onCheckedChange={(checked) => {
                                    setUserSettings({
                                        ...userSettings,
                                        saveExportSettingsInLocalstorage: checked
                                    })
                                }}
                            >
                                <Switch.Thumb className="SwitchThumb"/>
                            </Switch.Root>
                        </div>

                        <div className="row">
                            <p>Display Scene numbers next to Shot numbers</p>
                            <Switch.Root
                                className="SwitchRoot"
                                checked={userSettings.displaySceneNumbersNextToShotNumbers}
                                onCheckedChange={(checked) => {
                                    setUserSettings({
                                        ...userSettings,
                                        displaySceneNumbersNextToShotNumbers: checked
                                    })
                                }}
                            >
                                <Switch.Thumb className="SwitchThumb"/>
                            </Switch.Root>
                        </div>

                        <div className="row">
                            <p>Display shot numbers after Z as</p>
                            <RadioGroup.Root
                                className="RadioGroupRoot rect"
                                aria-label="Shot numbering after Z"
                                value={userSettings.shotNumberingAfterZ}
                                onValueChange={(value) => {
                                    setUserSettings({
                                        ...userSettings,
                                        shotNumberingAfterZ: value as "different" | "repeating"
                                    })
                                }}
                            >
                                <RadioGroup.Item className="RadioGroupItem" value="different">
                                    AA, AB
                                </RadioGroup.Item>
                                <RadioGroup.Item className="RadioGroupItem" value="repeating">
                                    AA, BB
                                </RadioGroup.Item>
                            </RadioGroup.Root>
                        </div>

                        <div className="row">
                            <p>Shotlist Scale</p>
                            <Slider
                                name={"Shotlist Scale"}
                                value={userSettings.shotlistScale}
                                min={0.8}
                                max={1.2}
                                step={0.01}
                                markerCount={5}
                                onChange={(value) => {
                                    setUserSettings({
                                        ...userSettings,
                                        shotlistScale: value
                                    })
                                    document.documentElement.style.setProperty("--shotlist-scale", value.toString());
                                }}
                            />
                        </div>
                    </>
                }

                <Separator.Root className={"Separator"}/>

                <div className="row">
                    <p>Report a bug or request a feature</p>
                    <Link href={"https://github.com/YanikKendler/shotly/issues/new/choose"} target={"_blank"}>new issue</Link>
                </div>

                <Separator.Root className={"Separator"}/>

                <div className="row">
                    <p>Use another account</p>
                    <button className={"logout"} onClick={() => Auth.logout()}>sign out</button>
                </div>
                <div className="row">
                    <p>Delete your account</p>
                    <button className={"delete bad"} onClick={deleteAccount}>delete account</button>
                </div>

                <Separator.Root className={"Separator"}/>

                <div className="row legal">
                    <Link href={"./legal/cookies"} target={"_blank"}>cookies</Link>
                    <Link href={"./legal/privacy"} target={"_blank"}>privacy</Link>
                    <Link href={"./legal/legalNotice"} target={"_blank"}>legal notice</Link>
                    <Link href={"./legal/termsOfUse"} target={"_blank"}>terms of use</Link>
                </div>

                <small>
                    shotly v{BUILD_INFO.version} - {BUILD_INFO.buildTime} - {Config.mode}
                </small>
            </>
        )

    const AccountDialog = (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className={"accountDialogOverlay dialogOverlay"}/>
                <Dialog.Content className={"accountContent dialogContent"} aria-describedby={"account dialog"} onOpenAutoFocus={e => e.preventDefault()}>
                    <VisuallyHidden.Root>
                        <Dialog.Description>Manage your account details and preferences.</Dialog.Description>
                    </VisuallyHidden.Root>

                    <Dialog.Title className={"title"}>Account</Dialog.Title>

                    {dialogContent}

                    <button className={"closeButton"} onClick={() => {
                        setIsOpen(false)
                    }}>
                        <X size={18}/>
                    </button>
                    {ConfirmDialog}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )

    return {openAccountDialog, AccountDialog};
}

