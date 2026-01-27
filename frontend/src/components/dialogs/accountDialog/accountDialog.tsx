'use client';

import * as Dialog from '@radix-ui/react-dialog';
import React, {useContext, useEffect, useState} from 'react';
import "./accountDialog.scss"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {Monitor, Moon, Sun, X} from "lucide-react"
import Auth from "@/Auth"
import {Query, UserDto, UserTier} from "../../../../lib/graphql/generated"
import {RadioGroup, Switch, VisuallyHidden} from "radix-ui"
import TextField from "@/components/inputs/textField/textField"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialoge"
import Loader from "@/components/feedback/loader/loader"
import Link from "next/link"
import PaymentService from "@/service/PaymentService"
import Config from "@/util/Config"
import Skeleton from "react-loading-skeleton"
import {wuConstants} from "@yanikkendler/web-utils/dist"
import Slider from "@/components/inputs/slider/slider"
import {BUILD_INFO} from "../../../../buildinfo"
import Separator from "@/components/separator/separator";
import SimpleTooltip from "@/components/tooltip/simpleTooltip"
import {wuTime} from "@yanikkendler/web-utils"
import Utils from "@/util/Utils"
import toast from "react-hot-toast"
import {errorNotification} from "@/service/NotificationService"

export interface UserSettings {
    saveExportSettingsInLocalstorage: boolean
    displaySceneNumbersNextToShotNumbers: boolean
    shotNumberingAfterZ: "different" | "repeating"
    shotlistScale: number
}

export function useAccountDialog() {
    const client = useApolloClient()
    const {confirm, ConfirmDialog} = useConfirmDialog()

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult);
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
        //load appearance from localstorage
        const appearance = localStorage.getItem(Config.localStorageKey.theme)
        if(appearance != null) {
            setSelectedAppearance(appearance)
        }
        else{
            setSelectedAppearance("system")
        }

        //load user settings from localstorage
        const userSettingsString = localStorage.getItem(Config.localStorageKey.userSettings)
        if(userSettingsString == null || userSettingsString == ""){
            //nothing in localstorage currently, so write the default settings
            writeSettingsToLocalStorage()
            document.documentElement.style.setProperty("--shotlist-scale", "1");
        }
        else {
            const newSettings = JSON.parse(userSettingsString) as UserSettings
            setUserSettings(newSettings)
            console.log(newSettings)
            document.documentElement.style.setProperty("--shotlist-scale", newSettings.shotlistScale?.toString() || "1");
        }

        setSettingsLoaded(true)
    }, [])

    /**
     * write theme to localstorage
     * this is handled individually and not with the other settings
     * because the appearance is applied and loaded in the root layout before anything else so that there is no flashing
     * @param value
     */
    useEffect(() => {
        if(!settingsLoaded) return

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

    //write settings to localstorage
    useEffect(() => {
        if(settingsLoaded == false) return

        writeSettingsToLocalStorage()
    }, [userSettings])

    async function getCurrentUser(){
        const result = await client.query({
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
                        revokeProAfter
                    }
                }`,
            fetchPolicy: "no-cache"
        })

        if(result.error) {
            errorNotification({
                title: "Failed to load user data",
                tryAgainLater: true
            })
            console.error("Error fetching current user:", result.error)
            return
        }

        setQuery(result)
    }

    const writeSettingsToLocalStorage = () => {
        const userSettingsString = JSON.stringify(userSettings)
        localStorage.setItem(Config.localStorageKey.userSettings, userSettingsString)
    }

    function openAccountDialog() {
        setIsOpen(true)
        getCurrentUser()
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
            errorNotification({
                title: "Failed to send password reset request",
                tryAgainLater: true
            })
            console.error("Error resetting password:", errors);
            setPasswordResetDisabled(false)
            return;
        }

        toast(`Please check your email: "${query.data.currentUser?.email}" for a link to reset your password.`)

        setTimeout(() => {
            setPasswordResetDisabled(false)
        },10000)
    }

    async function deleteAccount() {
        let decision = await confirm({
            title: "Are you sure?",
            message: `This will delete your account and all associated data. The following shotlist(s) will be deleted: ${query.data.currentUser?.shotlists?.map(s => `"${s!.name}"`).join(", ")}. All running subscriptions will be canceled. This action cannot be undone.`,
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
                }
            `
        },)

        if(errors) {
            errorNotification({
                title: "Failed to delete account",
                tryAgainLater: true
            })
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
            errorNotification({
                title: "Failed to update username",
                tryAgainLater: true
            })
            console.error("Error updating usename:", errors);
            return;
        }
    }

    let dialogContent

    if(deleting)
        dialogContent = <Loader text={"deleting user"}/>
    else
        dialogContent = (
            <>
                <TextField
                    label={"email"}
                    value={query.data.currentUser?.email || "unknown"}
                    disabled={true}
                    loading={query.loading}
                />

                <TextField
                    label={"display name"}
                    value={query.data.currentUser?.name || "unknown"}
                    info={"This a publicly visible name used for collaboration with others. You cannot use it to log in."}
                    maxLength={50}
                    placeholder={"John Doe"}
                    valueChange={updateUserName}
                    debounceValueChange={true}
                    loading={query.loading}
                />

                {
                    query.loading ?
                    <Skeleton height={"2.5rem"}/> :
                    <>
                        {
                            !Auth.getUser()?.isSocial &&
                            <div className="row">
                                <p>Send password reset request to your email</p>
                                <button disabled={passwordResetDisabled} className={"logout"} onClick={resetPassword}>Send
                                    email
                                </button>
                            </div>
                        }

                        <div className="row subscription">
                            <p>Subscription</p>
                            {
                                query.data.currentUser?.tier == UserTier.Basic ?
                                    query.data.currentUser?.hasCancelled == true ?
                                        <button onClick={PaymentService.manageSubscription}>Renew subscription</button> :
                                        <Link className={"accent"} href={"/pro"}>Upgrade to Pro</Link> :
                                    query.data.currentUser?.tier == UserTier.Pro ?
                                        <button onClick={PaymentService.manageSubscription}>Manage subscription</button> :
                                        query.data.currentUser?.tier == UserTier.ProStudent ?
                                            <SimpleTooltip
                                                text={`Your Subscription is active until ${wuTime.toDateString(new Date(query.data.currentUser.revokeProAfter)) || "Unkown"}.`}>
                                                <p>Pro for students {"<3"}</p></SimpleTooltip> :
                                            query.data.currentUser?.tier == UserTier.ProFree ?
                                                <p>( ͡° ͜ʖ ͡°)</p> :
                                                <p>Unknown</p>
                            }
                        </div>
                    </>
                }

                <Separator text={"Settings"}/>

                <div className="row">
                    <p>Appearance</p>
                    <RadioGroup.Root
                        className="RadioGroupRoot"
                        defaultValue={selectedAppearance}
                        aria-label="Appearance"
                        onValueChange={setSelectedAppearance}
                    >
                        <SimpleTooltip text={"Light"} asButton showHoverArea={false} hoverAreaExpansion={0} delay={700}>
                            <RadioGroup.Item className="RadioGroupItem" value="light">
                                <Sun size={20}/>
                            </RadioGroup.Item>
                        </SimpleTooltip>
                        <SimpleTooltip text={"Dark"} asButton showHoverArea={false} hoverAreaExpansion={0} delay={700}>
                            <RadioGroup.Item className="RadioGroupItem" value="dark">
                                <Moon size={20}/>
                            </RadioGroup.Item>
                        </SimpleTooltip>
                        <SimpleTooltip text={"System"} asButton showHoverArea={false} hoverAreaExpansion={0} delay={700}>
                            <RadioGroup.Item className="RadioGroupItem" value="system">
                                <Monitor size={20}/>
                            </RadioGroup.Item>
                        </SimpleTooltip>
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
                            <p>Display Scene numbers next to Shot letters</p>
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
                            <p>Display shot letters after Z as</p>
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

                <Separator text={"Support"}/>

                <div className="row">
                    <p>Visit the Documentation</p>
                    <Link href={"https://docs.shotly.at"} target={"_blank"}>Shotly Docs</Link>
                </div>
                <div className="row">
                    <p>Report a bug or request a feature</p>
                    <Link href={"https://github.com/YanikKendler/shotly/issues/new/choose"} target={"_blank"}>New issue</Link>
                </div>
                <div className="row">
                    <p>Contact me via email</p>
                    <Link href={"mailto:yanik@shotly.at"} target={"_blank"}>yanik@shotly.at</Link>
                </div>

                <Separator text={"Account"}/>

                <div className="row">
                    <p>Use another account</p>
                    <button className={"logout"} onClick={() => Auth.logout()}>Sign out</button>
                </div>
                <div className="row">
                    <p>Delete your account</p>
                    <button className={"delete bad"} onClick={deleteAccount}>Delete account</button>
                </div>

                <Separator/>

                <div className="row legal">
                    <Link href={"./legal/cookies"} target={"_blank"}>Cookies</Link>
                    <Link href={"./legal/privacy"} target={"_blank"}>Privacy</Link>
                    <Link href={"./legal/legalNotice"} target={"_blank"}>Legal notice</Link>
                    <Link href={"./legal/termsOfUse"} target={"_blank"}>Terms of use</Link>
                </div>

                <div className="row bottom">
                    <small>
                        All your changes are automatically saved.
                    </small>
                    <small>
                        shotly v{BUILD_INFO.version} - {BUILD_INFO.buildTime} - {Config.mode}
                    </small>
                </div>
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

