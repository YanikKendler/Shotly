import React, {
    forwardRef,
    RefObject,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle, useLayoutEffect,
    useRef,
    useState
} from "react"
import gql from "graphql-tag"
import {ShotlistContext} from "@/context/ShotlistContext";
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import ErrorDisplay from "@/components/feedback/errorDisplay/errorDisplay"
import "./sheetManager.scss"
import {Query, ShotAttributeDefinitionBase, ShotDto} from "../../../../../lib/graphql/generated"
import {AnyShotAttribute, AnyShotAttributeDefinition, ShotlyErrorCode} from "@/util/Types"
import Utils from "@/util/Utils"
import {wuText} from "@yanikkendler/web-utils"
import {ShotAttributeDefinitionParser} from "@/util/AttributeParser"
import Skeleton from "react-loading-skeleton"
import Sortable from 'sortablejs';
import {ValueCell, CellRef} from "@/components/shotlist/table/cell/valueCell"
import {Row, RowRef} from "../row/row";
import {SelectedScene} from "@/app/shotlist/[id]/page"
import {
    ShotlistOptionsDialogPage,
    ShotlistOptionsDialogSubPage
} from "@/components/dialogs/shotlistOptionsDialog/shotlistOptionsDialoge"
import CreatorCell from "@/components/shotlist/table/cell/creatorCell"
import LoaderCell from "@/components/shotlist/table/cell/loaderCell"

export interface SheetManagerRef {
    getCellRef: (row: number, column: number) => CellRef | null
    findCellRef: (id: number) => CellRef | null
    getRowRef: (row: number) => RowRef | null
    onMoveShot: (shotId: string, to: number) => void
    onCreateShot: (newShot: ShotDto) => void
    onDeleteShot: (shotId: string) => void
    moveFocusedCell: (e:KeyboardEvent, row:number, column: number) => void
    handleCreateShotKeybind: RefObject<() => void>
}

export interface SheetManagerProps {
    selectedScene: SelectedScene
    pageLoading: boolean
    shotAttributeDefinitions: ShotAttributeDefinitionBase[] | null
    isReadOnly: boolean
    shotlistHeaderRef: RefObject<HTMLDivElement | null>
}

/**
 * Query's shots based on the passed sceneId and displays them in a spreadsheet, handles all spreadsheet actions
 * @constructor
 */
const SheetManager = forwardRef<SheetManagerRef, SheetManagerProps>(({
    selectedScene,
    pageLoading,
    shotAttributeDefinitions,
    isReadOnly,
    shotlistHeaderRef
}, ref) => {
    const shotlistContext = useContext(ShotlistContext)
    const client = useApolloClient()

    const shotTableElement = useRef<HTMLDivElement | null>(null)
    const isSyncingScroll = useRef(false) //to not detect updating the scroll as a scroll
    const cellRefs = useRef(new Map<number, Map<number, CellRef | null>>) //Map[row = shot][column = attribute]
    const rowRefs = useRef<Map<number, RowRef | null>>(new Map())

    const sortableRef = useRef<Sortable|null>(null)

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)
    const shotIsBeingCreated = useRef<boolean>(false)
    const creationLoaderRef = useRef<HTMLDivElement>(null)
    const attributePositionToSelect = useRef<number>(-1) //position of attribute to select on next re-render

    const handleCreateShotKeybind = useRef(() => {})

    useImperativeHandle(ref, () => ({
        getCellRef: getCellRef,
        findCellRef: findCellRef,
        getRowRef: (row: number) => rowRefs.current.get(row) || null,
        onMoveShot: onMoveShot,
        onCreateShot: onCreateShot,
        onDeleteShot: onDeleteShot,
        moveFocusedCell: moveFocusedCell,
        handleCreateShotKeybind: handleCreateShotKeybind
    }))

    useEffect(() => {
        handleCreateShotKeybind.current = () => {
            let column = 0

            if(shotlistContext.focusedCell.current && shotlistContext.focusedCell.current.column != -1)
                column = shotlistContext.focusedCell.current.column

            createShot(column)
        }
    });

    useEffect(() => {
        //if the scene id exists and actually differs from the currently loaded
        if(selectedScene.id && selectedScene.id !== null && selectedScene.id != query.data.shots?.at(0)?.sceneId){
            isSyncingScroll.current = false
            shotIsBeingCreated.current = false
            attributePositionToSelect.current = -1

            setQuery(current => ({
                ...current,
                loading: true,
                data: {
                    shots: null,
                }
            }))
            loadShots()
        }
    }, [selectedScene])

    useEffect(() => {
        // select a attribute (in a newly created shot)
        // specified by attributePositionToSelect.current after the shots are re rendered
        if(attributePositionToSelect.current >= 0){
            const cellRef = getCellRef(cellRefs.current.size-1, attributePositionToSelect.current)
            cellRef?.setFocus()
            cellRef?.openMenu()

            attributePositionToSelect.current = -1
        }

        if (sortableRef.current?.el) {
            sortableRef.current.destroy()
        }

        /**
         * creating a new SortableJS instance
         * using a native JS library without react because the reordering is quite simple and the react re-renders
         * were creating substantial complexity and performance issues
         */
        const shots = document.querySelector('#shots')
        if(shots){
            sortableRef.current = Sortable.create(shots as HTMLElement, {
                handle: '.grip',
                animation: 150,
                forceFallback: true,
                fallbackTolerance: 5,
                onStart: (event) => {
                    if(event.oldIndex === undefined) return

                    shotlistContext.elementIsBeingDragged = true

                    rowRefs.current.get(event.oldIndex)?.closeContextOptions()
                },
                onEnd: (event) => {
                    //so that the drag ghost is hidden before re-rendering otherwise it hangs in the air for half a second
                    requestAnimationFrame(() => {
                        if(!event.item || event.oldIndex === undefined || event.newIndex === undefined) return

                        moveShot(
                            event.item.dataset.shotId as string,
                            event.newIndex
                        )

                        shotlistContext.elementIsBeingDragged = false
                    })
                }
            })
        }
    }, [query])

    const loadShots = async () => {
        const result = await client.query({
            query : gql`
                query shots($sceneId: String!){
                    shots(sceneId: $sceneId){
                        id
                        position
                        attributes{
                            id
                            definition{
                                id, 
                                name, 
                                position
                                type
                            }
                            type

                            ... on ShotSingleSelectAttributeDTO{
                                singleSelectValue{id,name}
                            }

                            ... on ShotMultiSelectAttributeDTO{
                                multiSelectValue{id,name}
                            }
                            ... on ShotTextAttributeDTO{
                                textValue
                            }
                        }
                        sceneId
                    }
                }
            `,
            variables: { sceneId: selectedScene.id }
        })

        if(result.errors){
            shotlistContext.handleError({
                locationKey: "loadShots",
                message: "Failed to load shots",
                cause: result.errors
            })
        }

        shotlistContext.setShotCount(result.data?.shots?.length || 0)

        cellRefs.current = new Map()
        rowRefs.current = new Map()

        setQuery(result)
    }

    const setCreationLoaderVisibility = (visible:boolean) => {
        if(!creationLoaderRef.current) return

        shotIsBeingCreated.current = visible

        creationLoaderRef.current.style.display = visible ? "flex" : "none"
    }

    const refocusCell = () =>{
        getCellRef(shotlistContext.focusedCell.current.row, shotlistContext.focusedCell.current.column)?.setFocus()
    }

    const moveFocusedCell = useCallback((e:KeyboardEvent, row:number = 0, column: number = 0) => {
        if(!shotlistContext.focusedCell.current || shotlistContext.focusedCell.current.row < 0 && shotlistContext.focusedCell.current.column < 0) return

        e.stopPropagation()
        e.preventDefault()

        const newRow = wuText.clamp(
            0,
            shotlistContext.focusedCell.current.row + row,
            cellRefs.current.size - 1
        )

        const newColumn = wuText.clamp(
            0,
            shotlistContext.focusedCell.current.column + column,
            (cellRefs.current.get(newRow)?.size || 1) - 1
        )

        shotlistContext.setFocusedCell(newRow, newColumn)

        getCellRef(newRow, newColumn)?.setFocus()
    }, [shotlistContext.focusedCell])

    const setCellRef = useCallback((row: number, column: number, value: CellRef | null) => {
        if (!cellRefs.current.has(row)) {
            cellRefs.current.set(row, new Map());
        }
        cellRefs.current.get(row)!.set(column, value);
    },[cellRefs.current])

    const getCellRef = (row: number, column: number) => {
        return cellRefs.current.get(row)?.get(column) || null;
    }

    const findCellRef = (id: number) => {
        for (let [row, columns] of cellRefs.current) {
            for (let [column, cellRef] of columns) {
                if (cellRef && cellRef.id === id) {
                    return cellRef;
                }
            }
        }

        return null
    }

    const createShot = async (attributePosition: number) => {
        if(shotIsBeingCreated.current == true) {
            return
        }

        shotlistContext.setSaveState("createShot", "saving")

        setCreationLoaderVisibility(true)
        attributePositionToSelect.current = attributePosition

        const { data, errors } = await client.mutate({
            mutation: gql`
                mutation createShot($sceneId: String!) {
                    createShot(sceneId: $sceneId){
                        id
                        position
                        attributes{
                            id
                            definition{
                                id, 
                                name, 
                                position,
                                type
                            }
                            type

                            ... on ShotSingleSelectAttributeDTO{
                                singleSelectValue{id,name}
                            }

                            ... on ShotMultiSelectAttributeDTO{
                                multiSelectValue{id,name}
                            }
                            ... on ShotTextAttributeDTO{
                                textValue
                            }
                        }
                    }
                }
            `,
            variables: { sceneId: selectedScene.id },
        })

        if (errors) {
            shotlistContext.handleError({
                locationKey: "createShot",
                message: "Failed to create shot",
                cause: errors
            })
            shotlistContext.setSaveState("createShot", "error")
            return
        }

        onCreateShot(data.createShot)

        setCreationLoaderVisibility(false)

        shotlistContext.setSaveState("createShot", "saved")
    }

    const onCreateShot = useCallback((newShot: ShotDto) => {
        setQuery(current => {
            const newShots = [...(current.data.shots || []), newShot]
            shotlistContext.setShotCount(newShots.length)

            return {
                ...current,
                data: {
                    ...current.data,
                    shots: newShots
                }
            }
        })
    }, [shotlistContext])

    const onDeleteShot = useCallback((shotId: string) => {
        setQuery(current => {
            if(!current.data.shots) return current

            let currentShots = current.data.shots as ShotDto[]
            let newShots = currentShots.filter((shot) => shot.id != shotId)
            shotlistContext.setShotCount(newShots.length)

            return {
                ...current,
                data: {
                    ...current.data,
                    shots: newShots
                }
            }
        })
    }, [shotlistContext])

    const moveShot = useCallback((shotId: string, to: number) => {
        shotlistContext.setSaveState("moveShot", "saving")

        client.mutate({
            mutation : gql`
            mutation updateShot($id: String!, $position: Int!) {
                updateShot(editDTO:{
                    id: $id,
                    position: $position
                }){
                    id
                    position
                }
            }
        `,
            variables: {id: shotId, position: to},
        }).then(({errors}) => {
            if(errors) {
                shotlistContext.handleError({
                    locationKey: "moveShot",
                    message: "Failed to move shot.",
                    cause: errors
                })
                shotlistContext.setSaveState("moveShot", "error")
                return
            }
            shotlistContext.setSaveState("moveShot", "saved")
        })

        onMoveShot(shotId, to)
    }, [query])

    const onMoveShot = useCallback((shotId: string, to: number) => {
        setQuery(current => {
            const from = current.data.shots?.findIndex((shot) => shot?.id == shotId)

            if(from == undefined || from < 0) return current

            return {
                ...current,
                data: {
                    ...current.data,
                    shots: Utils.reorderArray(current.data.shots || [], from, to)
                }
            }
        })
    }, [])

    const handleScroll = () => {
        const table = shotTableElement.current
        const header = shotlistHeaderRef.current

        if (!table || !header) return

        if (isSyncingScroll.current) return
        isSyncingScroll.current = true

        requestAnimationFrame(() => {
            header.scrollLeft = table.scrollLeft
            isSyncingScroll.current = false
        })
    }

    if(!pageLoading && (!shotAttributeDefinitions || (!isReadOnly && shotAttributeDefinitions.length == 0))) {
        return <div className="sheetManager">
            <p className={"empty"}>
                {"Add a "}
                <button
                    className="inline noPadding accent noShotAttributes"
                    onClick={() => shotlistContext.openShotlistOptionsDialog({
                        main: ShotlistOptionsDialogPage.attributes,
                        sub: ShotlistOptionsDialogSubPage.shot
                    })}
                >
                    shot attribute
                </button>
                {" to get started"}
            </p>
        </div>
    }

    if(pageLoading || query.loading) {
        return <div className="sheetManager">
            <Skeleton count={5} height="38px"/>
        </div>
    }

    if(selectedScene.id == null)
        return <div className="sheetManager">
            <p className="empty">Please select a scene from the sidebar</p>
        </div>

    if(query.errors && query.errors.length > 0){
        const error = query.errors[0]?.extensions?.code as ShotlyErrorCode

        return <div className="sheetManager">
            {
                error == ShotlyErrorCode.NOT_FOUND ?
                <ErrorDisplay
                    title="Scene was not found"
                    description="The selected scene was not found, please select one from the Sidebar."
                /> :
                <ErrorDisplay
                    title="Scene could not be loaded"
                    description="The selected scene could not be loaded, please select one from the Sidebar."
                />
            }
        </div>
    }

    if(query.error)
        return <div className="sheetManager"><ErrorDisplay title={query.error.message}/></div>

    if(isReadOnly){
        if((query.data.shots && query.data.shots.length <= 0)){
            return <div className="sheetManager">
                <p className={"empty"}>
                    No Shots here yet ¯\(o_o)/¯
                </p>
            </div>
        }
    }

    return (
        <div
            className="sheetManager"
            onScroll={handleScroll}
            onScrollEnd={handleScroll}
            ref={shotTableElement}
        >
            <div id="shots">
                {(query.data.shots as ShotDto[])?.map((shot: ShotDto, row: number) => (
                    <Row
                        key={shot.id}
                        shot={shot}
                        position={row}
                        scenePosition={selectedScene.position || 0}
                        onDelete={onDeleteShot}
                        moveShot={moveShot}
                        isReadOnly={isReadOnly}
                        ref={(node) => {
                            rowRefs.current.set(row, node)

                            return () => {
                                rowRefs.current.delete(row)
                            }
                        }}
                    >
                        {(shot.attributes as AnyShotAttribute[]).map((attribute: AnyShotAttribute, column: number)=> (
                            <ValueCell
                                key={attribute.id}
                                attribute={attribute}
                                row={row}
                                column={column}
                                ref={(node) => {
                                    setCellRef(row, column, node)

                                    return () => {
                                        setCellRef(row, column, null)
                                    }
                                }}
                                isReadOnly={isReadOnly}
                            />
                        ))}
                    </Row>
                ))}
            </div>

            <div ref={creationLoaderRef} style={{display: "none"}} className={"sheetRow"}>
                <LoaderCell isNumber/>

                {shotAttributeDefinitions?.map((definition) => {
                    return (
                        <LoaderCell key={definition.id}/>
                    )
                })}
            </div>

            {
                !isReadOnly &&
                <div className={"sheetRow"}>
                    <CreatorCell isNumber createShot={() => createShot(-1)}/>

                    {shotAttributeDefinitions?.map((definition, index) => {
                        return (
                            <CreatorCell
                                shotAttributeDefinition={definition}
                                createShot={() => createShot(index)}
                                key={definition.id}
                            />
                        )
                    })}
                </div>
            }
            {/*<p className={"shotCount"}>{query.data.shots?.length}</p>*/}
        </div>
    )
})

export default SheetManager