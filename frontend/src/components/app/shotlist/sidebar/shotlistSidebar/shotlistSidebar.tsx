import NavigationItem from "@/components/app/navigation/navigationItem";
import {Columns3Cog, Download, Settings, Users } from "lucide-react";
import SceneList, {SceneListRef} from "../sceneList/sceneList";
import Skeleton from "react-loading-skeleton"
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import {Query, UserMinimalDto} from "../../../../../../lib/graphql/generated"
import {
    ShotlistOptionsDialogMainPage,
    ShotlistOptionsDialogPages
} from "@/components/app/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import React, {Dispatch, RefObject, SetStateAction, useContext, useEffect, useRef} from "react"
import {ShotlistContext} from "@/context/ShotlistContext"
import gql from "graphql-tag"
import {wuGeneral} from "@yanikkendler/web-utils"
import {SelectedScene} from "@/app/(application)/shotlist/[id]/page"
import "./shotlistSidebar.scss"
import SimplePopover from "@/components/basic/popover/simplePopover"
import Sidebar from "@/components/app/sidebar/sidebar"

export default function ShotlistSidebar({
    query,
    setQuery,
    openShotlistOptionsDialog,
    isViewOrCommentOnly,
    reloadInProgress,
    sceneCount,
    setSceneCount,
    selectedScene,
    setSelectedScene,
    presentCollaborators,
    sceneListRef
}:{
    query: ApolloQueryResult<Query>
    setQuery: Dispatch<SetStateAction<ApolloQueryResult<Query>>>
    openShotlistOptionsDialog: (pages?: ShotlistOptionsDialogPages) => void
    isViewOrCommentOnly: boolean
    reloadInProgress: boolean
    sceneCount: number
    setSceneCount: Dispatch<SetStateAction<number>>
    selectedScene: SelectedScene
    setSelectedScene: Dispatch<SetStateAction<SelectedScene>>
    presentCollaborators: UserMinimalDto[]
    sceneListRef: RefObject<SceneListRef | null>
}){
    const shotlistContext = useContext(ShotlistContext)
    const client = useApolloClient()

    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(nameInputRef.current && query.data.shotlist?.name)
            nameInputRef.current.value = query.data.shotlist.name
    }, [query.data.shotlist?.name])

    const updateShotlistName = async (name: string) => {
        shotlistContext.setSaveState("updateShotlistName", "saving")

        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation updateShotlist($shotlistId: String!, $name: String!) {
                    updateShotlist(editDTO: {
                        id: $shotlistId
                        name: $name
                    }){
                        id
                        name
                    }
                }
            `,
            variables: { shotlistId: query.data.shotlist?.id, name: name },
        });

        if (errors) {
            shotlistContext.handleError({
                locationKey: "updateShotlistName",
                message: "Failed to update shotlist name",
                cause: errors
            })
            shotlistContext.setSaveState("updateShotlistName", "error")
            return
        }

        setQuery(current => ({
            ...current,
            data: {
                ...current.data,
                shotlist: {
                    ...current.data.shotlist,
                    name: data.updateShotlist.name
                }
            }
        }))

        shotlistContext.setSaveState("updateShotlistName", "saved")
    }

    const debounceUpdateShotlistName = wuGeneral.debounce(updateShotlistName)

    const collaboratorsArePresent = presentCollaborators && presentCollaborators.length > 0

    return (
        <Sidebar
            className="shotlistSidebar"
            additionalNavItems={<>
                <NavigationItem
                    Icon={Settings}
                    action={() => openShotlistOptionsDialog({main: ShotlistOptionsDialogMainPage.general})}
                    description={<>Shotlist Settings <span className="key">Alt</span> <span className="gray">+</span> <span className="key">O</span></>}
                />
                <NavigationItem
                    Icon={Columns3Cog}
                    action={() => openShotlistOptionsDialog({main: ShotlistOptionsDialogMainPage.attributes})}
                    description={<>Attributes <span className="key">Alt</span> <span className="gray">+</span> <span className="key">O</span></>}
                />
                <NavigationItem
                    Icon={Users}
                    action={() => openShotlistOptionsDialog({main: ShotlistOptionsDialogMainPage.collaborators})}
                    description={<>Collaborators <span className="key">Alt</span> <span className="gray">+</span> <span className="key">O</span></>}
                />
                <NavigationItem
                    Icon={Download}
                    action={() => openShotlistOptionsDialog({main: ShotlistOptionsDialogMainPage.export})}
                    description={<>Export <span className="key">Alt</span> <span className="gray">+</span> <span className="key">O</span></>}
                />
            </>}
            heading={
                <input
                    type="text"
                    defaultValue={query.data.shotlist?.name || ""}
                    placeholder={"shotlist name"}
                    className={"name"}
                    onInput={e => debounceUpdateShotlistName(e.currentTarget.value)}
                    role={"heading"}
                    disabled={isViewOrCommentOnly}
                    ref={nameInputRef}
                />
            }
            list={
                <SceneList
                    query={query}
                    setQuery={setQuery}
                    sceneCount={sceneCount}
                    setSceneCount={setSceneCount}
                    selectedScene={selectedScene}
                    setSelectedScene={setSelectedScene}

                    isReadOnly={isViewOrCommentOnly}
                    reloadInProgress={reloadInProgress}

                    ref={sceneListRef}
                />
            }
            bottom={
                !collaboratorsArePresent ? undefined :
                <SimplePopover
                    content={
                        Array.from(presentCollaborators).map(user => (
                            <p key={user.id}>{user.name}</p>
                        ))
                    }
                    contentClassName={"presentCollaborators"}
                    className={"presentCollaborators"}
                >
                    {/*TODO add animations to new collaborators appearing and disappearing*/}
                    <>
                        {presentCollaborators.map(user => (
                            <div key={user.id} className={"collaborator"}>
                                <span>
                                    {user.name ? user.name.at(0)?.toUpperCase() : "?"}
                                </span>
                            </div>
                        ))}
                    </>
                </SimplePopover>
            }
            isLoading={query.loading}
        />
    )
}