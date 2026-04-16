'use client';

import React, {useContext, useEffect, useRef, useState} from 'react';
import "./accountDialog.scss"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import gql from "graphql-tag"
import {
    BookText,
    Bug, GraduationCap,
    LogOut,
    LucideMail,
    Mail,
    Monitor,
    Moon,
    Rocket, SquareArrowOutUpRight,
    Sun,
    Trash,
    User,
    UserRound,
    X
} from "lucide-react"
import Auth from "@/Auth"
import {Query, UserDto, UserTier} from "../../../../lib/graphql/generated"
import {RadioGroup, Switch, VisuallyHidden} from "radix-ui"
import TextField from "@/components/inputs/textField/textField"
import {useConfirmDialog} from "@/components/dialogs/confirmDialog/confirmDialog"
import Loader from "@/components/feedback/loader/loader"
import Link from "next/link"
import PaymentService from "@/service/PaymentService"
import Config from "@/Config"
import Skeleton from "react-loading-skeleton"
import {wuConstants, wuGeneral} from "@yanikkendler/web-utils/dist"
import Slider from "@/components/inputs/slider/slider"
import {BUILD_INFO} from "../../../../buildinfo"
import Separator from "@/components/separator/separator";
import SimpleTooltip from "@/components/tooltip/simpleTooltip"
import {wuTime} from "@yanikkendler/web-utils"
import Utils from "@/util/Utils"
import toast from "react-hot-toast"
import {errorNotification, successNotification} from "@/service/NotificationService"
import {td} from "@/service/Analytics"
import Dialog, {DialogRef} from "@/components/dialog/dialog"

export interface UserSettings {
    saveExportSettingsInLocalstorage: boolean
    displaySceneNumbersNextToShotNumbers: boolean
    shotNumberingAfterZ: "different" | "repeating"
    shotlistScale: number
}

export function useAccountDialog() {
    const client = useApolloClient()
    const {confirm, ConfirmDialog} = useConfirmDialog()

    const dialogElementRef = useRef<DialogRef>(null)

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)
    const [deleting, setDeleting] = useState(false)
    const [passwordResetDisabled, setPasswordResetDisabled] = useState(false)

    const [selectedAppearance, setSelectedAppearance] = useState<string>("system")
    const [userSettings, setUserSettings] = useState<UserSettings>({
        saveExportSettingsInLocalstorage: true,
        displaySceneNumbersNextToShotNumbers: false,
        shotNumberingAfterZ: "repeating",
        shotlistScale: 1,
    })

    const [settingsLoaded, setSettingsLoaded] = useState(false)
    
    useEffect(() => {
        if(settingsLoaded) return

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
            document.documentElement.style.setProperty("--shotlist-scale", "1")
        }
        else {
            const newSettings = JSON.parse(userSettingsString) as UserSettings
            setUserSettings(newSettings)
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

        showSettingsSavedToast()
    }, [selectedAppearance])

    //write settings to localstorage
    useEffect(() => {
        if(!settingsLoaded) return

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

    const showSettingsSavedToast = () => {
        successNotification({
            title: "Preferences updated."
        })
    }

    const writeSettingsToLocalStorage = () => {
        const userSettingsString = JSON.stringify(userSettings)
        localStorage.setItem(Config.localStorageKey.userSettings, userSettingsString)
    }

    function openAccountDialog() {
        dialogElementRef.current?.open()
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
        }, wuConstants.Time.msPerMinute)
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

        successNotification({
            title: "Username updated",
            message: `Your name is now "${name}"`
        })
    }

    let dialogContent

    if(deleting)
        dialogContent = <Loader text={"Deleting user..."}/>
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
                                <button disabled={passwordResetDisabled} className={"logout"} onClick={resetPassword}>
                                    Send email
                                </button>
                            </div>
                        }

                        <div className="row subscription">
                            <p>Subscription</p>
                            {
                                query.data.currentUser?.tier == UserTier.Basic ?
                                    query.data.currentUser?.hasCancelled == true ?
                                        <button className={"primary"} onClick={PaymentService.manageSubscription}><Rocket size={18}/>Renew subscription</button> :
                                        <Link className={"primary"} href={"/pro"}><Rocket size={18}/>Upgrade to Pro</Link> :
                                query.data.currentUser?.tier == UserTier.Pro ?
                                    <button onClick={PaymentService.manageSubscription}>Manage subscription<SquareArrowOutUpRight size={16}/></button> :
                                query.data.currentUser?.tier == UserTier.ProStudent ?
                                    <Link href={"/pro"}><GraduationCap size={18}/>Pro for students</Link>:
                                query.data.currentUser?.tier == UserTier.ProFree ?
                                    <Link href={"/pro"}>( ͡° ͜ʖ ͡°)</Link> :
                                    <SimpleTooltip
                                        content={
                                            <>
                                                <p>This is an error - please contact me at: <Link className={"inline noPadding accent"} href={"mailto:yanik@shotly.at"}>yanik@shotly.at</Link></p>
                                            </>
                                        }
                                        delay={0}
                                    >
                                        <p className={"value error"}>Unknown</p>
                                    </SimpleTooltip>
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
                        onValueChange={(value) => {
                            td.signal("Account.Settings.AppearanceChanged", {appearance: value})
                            setSelectedAppearance(value)
                        }}
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
                                    td.signal("Account.Settings.RememberExportSettings")
                                    showSettingsSavedToast()
                                    setUserSettings(current => ({
                                        ...current,
                                        saveExportSettingsInLocalstorage: checked
                                    }))
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
                                    td.signal("Account.Settings.SceneNumbers")
                                    showSettingsSavedToast()
                                    setUserSettings(current => ({
                                        ...current,
                                        displaySceneNumbersNextToShotNumbers: checked
                                    }))
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
                                    td.signal("Account.Settings.ShotNumbering")
                                    showSettingsSavedToast()
                                    setUserSettings(current => ({
                                        ...current,
                                        shotNumberingAfterZ: value as "different" | "repeating"
                                    }))
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
                                    td.signal("Account.Settings.ShotlistScale", {scale: value})
                                    showSettingsSavedToast()
                                    setUserSettings(current => ({
                                        ...current,
                                        shotlistScale: value
                                    }))
                                    document.documentElement.style.setProperty("--shotlist-scale", value.toString())
                                }}
                            />
                        </div>
                    </>
                }

                <Separator text={"Support"}/>

                <div className="row">
                    <p>Visit the Documentation</p>
                    <Link
                        href={"https://docs.shotly.at"}
                        target={"_blank"}
                        onClick={() => {td.signal("Account.Support.Docs")}}
                    >
                        <BookText size={16} />Shotly Docs
                    </Link>
                </div>
                <div className="row">
                    <p>Report a bug or request a feature</p>
                    <Link
                        href={"https://github.com/YanikKendler/shotly/issues/new/choose"}
                        target={"_blank"}
                        onClick={() => {td.signal("Account.Support.NewIssue")}}
                    >
                        <Bug size={16}/> New issue
                    </Link>
                </div>
                <div className="row">
                    <p>Contact me via email</p>
                    <Link
                        href={"mailto:yanik@shotly.at"}
                        target={"_blank"}
                        onClick={() => {td.signal("Account.Support.Mail")}}
                    >
                        <Mail size={16}/>yanik@shotly.at
                    </Link>
                </div>

                <Separator text={"Account"}/>

                <div className="row">
                    <p>Use another account</p>
                    <button
                        className={"logout"} onClick={() => Auth.logout()}
                    >
                        <LogOut size={16}/>Sign out
                    </button>
                </div>
                {
                    query.loading ?
                    <Skeleton height={"2.5rem"}/> :
                    <div className="row">
                        <p>Delete your account</p>
                        <button
                            className={"delete bad"}
                            onClick={deleteAccount}
                        >
                            <Trash size={16}/>
                            Delete account
                        </button>
                    </div>
                }

                <Separator/>

                <div className="row legal">
                    <Link href={"/legal/cookies"} target={"_blank"}>Cookies</Link>
                    <Link href={"/legal/privacy"} target={"_blank"}>Privacy</Link>
                    <Link href={"/legal/legalNotice"} target={"_blank"}>Legal notice</Link>
                    <Link href={"/legal/termsOfUse"} target={"_blank"}>Terms of use</Link>
                    <Separator orientation={"vertical"}/>
                    <Link href={"/changelog"} target={"_blank"}>Changelog</Link>
                </div>

                <div className="row bottom">
                    <small>
                        All changes are automatically saved.
                    </small>
                    <small>
                        shotly v{BUILD_INFO.version} • {BUILD_INFO.buildTime} • {Config.mode == "prod-deployment" ? "prod" : Config.mode}
                    </small>
                </div>
            </>
        )

    const AccountDialog = (
        <Dialog contentClassName={"accountDialogContent"} ref={dialogElementRef} showScrollGradient>
            <div className="top sticky">
                <h2 className={"title"}>Account</h2>
                <button className={"close"} onClick={dialogElementRef.current?.close}>
                    <X size={18}/>
                </button>
            </div>

            {dialogContent}

            {ConfirmDialog}
        </Dialog>
    )

    return {openAccountDialog, AccountDialog};
}

