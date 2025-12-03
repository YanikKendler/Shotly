import React, {RefObject, UIEventHandler, useCallback, useContext, useEffect, useRef, useState} from "react"
import gql from "graphql-tag"
import {ShotlistContext} from "@/context/ShotlistContext";
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import Loader from "@/components/feedback/loader/loader"
import ErrorDisplay from "@/components/feedback/errorDisplay/errorDisplay"
import "./sheetManager.scss"
import {Query, ShotAttributeDefinitionBase, ShotDto} from "../../../../../lib/graphql/generated"
import {AnyShotAttribute, AnyShotAttributeDefinition} from "@/util/Types"
import Utils from "@/util/Utils"
import { tinykeys } from "@/../node_modules/tinykeys/dist/tinykeys"/*package has incorrectly configured type exports*/
import {wuText} from "@yanikkendler/web-utils"
import {ShotAttributeDefinitionParser} from "@/util/AttributeParser"
import {useSelectRefresh} from "@/context/SelectRefreshContext"
import Skeleton from "react-loading-skeleton"
import ShotService from "@/service/ShotService"
import Sortable from 'sortablejs';
import {Cell, CellRef} from "@/components/shotlist/spreadsheet/cell/cell"
import {Row, RowRef} from "../row/row";

/**
 * Query's shots based on the passed sceneId and displays them in a spreadsheet, handles all spreadsheet actions
 * @param sceneId
 * @param shotAttributeDefinitions
 * @constructor
 */
export default function SheetManager({
    sceneId,
    shotAttributeDefinitions,
    isReadOnly,
    shotlistHeaderRef
}:{
    shotAttributeDefinitions: ShotAttributeDefinitionBase[]
    sceneId: string
    isReadOnly: boolean
    shotlistHeaderRef: RefObject<HTMLDivElement | null>
}){
    const shotlistContext = useContext(ShotlistContext)
    const selectRefreshContext = useSelectRefresh()
    const client = useApolloClient()

    const shotTableElement = useRef<HTMLDivElement | null>(null)
    const isSyncingScroll = useRef(false) //to not detect updating the scroll as a scroll
    const cellRefs = useRef(new Map<number, Map<number, CellRef | null>>) //Map[row = shot][column = attribute]
    const rowRefs = useRef<Map<number, RowRef | null>>(new Map())

    const sortableRef = useRef<Sortable|null>(null)

    const [query, setQuery] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)
    const creationLoaderRef = useRef<HTMLDivElement>(null)
    const attributePositionToSelect = useRef<number>(-1) //position of attribute to select on next re-render

    useEffect(() => {
        let unsubscribe = tinykeys(window, {
            "ArrowLeft": (e) => moveFocusedCell(e, 0, -1),
            "ArrowRight": (e) => moveFocusedCell(e, 0, 1),
            "ArrowUp": (e) => moveFocusedCell(e, -1, 0),
            "ArrowDown": (e) => moveFocusedCell(e, 1, 0),
        })
        return () => {
            unsubscribe()
        }
    }, [])

    //the selectRefreshContext causes the current cell to lose focus after creating a new option since the component is re-rendered
    useEffect(() => {
        if(selectRefreshContext.lastRefresh.includes("shot")){
            refocusCell()
        }
    }, [selectRefreshContext.lastRefresh]);

    useEffect(() => {
        // select a attribute (in a newly created shot)
        // specified by attributePositionToSelect.current after the shots are re rendered
        if(attributePositionToSelect.current >= 0){
            getCellRef(cellRefs.current.size-1, attributePositionToSelect.current)?.setFocus()
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

                    rowRefs.current.get(event.oldIndex)?.closePopover()
                },
                onEnd: (event) => {
                    //so that the drag ghost is hidden before re-rendering otherwise it hangs in the air for half a second
                    requestAnimationFrame(() => {
                        if(!event.item || event.oldIndex === undefined || event.newIndex === undefined) return

                        moveShot(
                            event.item.dataset.shotId as string,
                            event.oldIndex,
                            event.newIndex
                        )

                        shotlistContext.elementIsBeingDragged = false
                    })
                }
            })
        }
    }, [query])

    useEffect(() => {
        if(sceneId){
            setQuery({
                ...query,
                loading: true
            })
            loadShots()
        }
    }, [sceneId])

    const setCreationLoaderVisibility = (visible:boolean) => {
        if(!creationLoaderRef.current) return

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

        shotlistContext.focusedCell.current = {row: newRow, column: newColumn}

        getCellRef(newRow, newColumn)?.setFocus()
    }, [shotlistContext.focusedCell])

    const setCellRef = useCallback((row: number, column: number, value: CellRef | null) => {
        if (!cellRefs.current.has(row)) {
            cellRefs.current.set(row, new Map());
        }
        cellRefs.current.get(row)!.set(column, value);
    },[cellRefs.current])

    const getCellRef = (row: number, column: number) => {
        return cellRefs.current.get(row)?.get(column);
    }

    const loadShots = async () => {
        console.log("started loading shots")
        const result = await client.query({
            query : gql`
                query shots($sceneId: String!){
                    shots(sceneId: $sceneId){
                        id
                        position
                        attributes{
                            id
                            definition{id, name, position}

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
            variables: { sceneId: sceneId },
            fetchPolicy: "no-cache",
        })

        shotlistContext.setShotCount(result.data.shots.length || 0)

        setQuery(result)

        console.log(result)
    }

    const createShot = async (attributePosition: number) => {
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
                            definition{id, name, position}

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
            variables: { sceneId: sceneId },
        })

        if (errors) {
            console.error(errors);
            return;
        }

        shotlistContext.setShotCount((query.data.shots?.length || 0) + 1)

        const newShots = [...query.data.shots || [], data.createShot]

        setQuery({...query, data: {...query.data, shots: newShots}})

        setCreationLoaderVisibility(false)
    }

    const deleteShot = useCallback((shotId: string) => {
        if(!query || !query.data.shots) return

        let currentShots = query.data.shots as ShotDto[]
        let newShots= currentShots.filter((shot) => shot.id != shotId)

        setQuery({
            ...query,
            data: {
                ...query.data,
                shots: newShots
            }
        })

        shotlistContext.setShotCount(newShots.length)
    }, [query])

    const moveShot = useCallback((shotId: string, from: number, to: number) => {
        ShotService.updateShot(shotId, to).then(response => {
            if(response.errors) console.error(response.errors) //TODO notify
        })

        setQuery({
            ...query,
            data: {
                ...query.data,
                shots: Utils.reorderArray(query.data.shots || [], from, to)
            }
        })
    }, [query])

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

    if(query.loading)
        return <div className="sheetManager">
            <Skeleton count={5} height="38px"/>
        </div>

    if(query.error)
        return <ErrorDisplay title={query.error.message}/>

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
                        onDelete={deleteShot}
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
                            <Cell
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
                            />
                        ))}
                    </Row>
                ))}
            </div>

            <div ref={creationLoaderRef} style={{display: "none"}} className={"sheetRow"}>
                <Cell row={-1} column={-1} type={["number", "loader"]}><Skeleton/></Cell>

                {shotAttributeDefinitions.map((shotAttributeDefinition, index) => {
                    return (
                        <Cell
                            row={-1}
                            column={index}
                            type={["loader"]}
                            key={shotAttributeDefinition.id}
                        >
                            <Skeleton/>
                        </Cell>
                    )
                })}
            </div>

            <div className={"sheetRow"}>
                <Cell row={-1} column={-1} type={["number", "create"]}><span>#</span></Cell>

                {shotAttributeDefinitions.map((shotAttributeDefinition, index) => {
                    let Icon = ShotAttributeDefinitionParser.toIcon(shotAttributeDefinition as AnyShotAttributeDefinition)
                    return (
                        <Cell
                            row={-1}
                            column={index}
                            type={["create"]}
                            key={shotAttributeDefinition.id}
                            onClick={() => createShot(index)}
                        >
                            <p>{shotAttributeDefinition.name || "Unnamed"}</p>
                            <div className="icon">
                                <Icon size={18}/>
                            </div>
                        </Cell>
                    )
                })}
            </div>
        </div>
    )
}