import React, {useCallback, useContext, useEffect, useRef, useState} from "react"
import gql from "graphql-tag"
import {ShotlistContext} from "@/context/ShotlistContext";
import {ApolloQueryResult, useApolloClient} from "@apollo/client"
import Loader from "@/components/loader/loader"
import ErrorDisplay from "@/components/errorDisplay/errorDisplay"
import "./sheetManager.scss"
import {Query, ShotAttributeDefinitionBase, ShotDto} from "../../../../lib/graphql/generated"
import Row from "@/components/spreadsheet/row/row"
import {AnyShotAttribute, AnyShotAttributeDefinition} from "@/util/Types"
import Utils from "@/util/Utils"
import Cell, {CellRef} from "@/components/spreadsheet/cell/cell"
import { tinykeys } from "@/../node_modules/tinykeys/dist/tinykeys"//package has incorrectly configured type exports
import {wuText} from "@yanikkendler/web-utils"
import {ShotAttributeDefinitionParser} from "@/util/AttributeParser"
import {useSelectRefresh} from "@/context/SelectRefreshContext"
import Skeleton from "react-loading-skeleton"

/**
 * Query's shots based on the passed sceneId and displays them in a spreadsheet, handles all spreadsheet actions
 * @param sceneId
 * @param shotAttributeDefinitions
 * @constructor
 */
export default function SheetManager({
    sceneId,
    shotAttributeDefinitions
}:{
    shotAttributeDefinitions: ShotAttributeDefinitionBase[]
    sceneId: string
}){
    const shotlistContext = useContext(ShotlistContext)
    const selectRefreshContext = useSelectRefresh()
    const client = useApolloClient()

    //Map[row = shot][column = attribute]
    const cellRefs = useRef(new Map<number, Map<number, CellRef | null>>)

    const [shots, setShots] = useState<ApolloQueryResult<Query>>(Utils.defaultQueryResult)
    //const [showCreationLoader, setShowCreationLoader] = useState(false)
    const creationLoaderRef = useRef<HTMLDivElement>(null)

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

    //the refresh context would cause the current cell to loose focus since the component is re-rendered
    useEffect(() => {
        if(selectRefreshContext.lastRefresh.includes("shot")){
            refocusCell()
        }
    }, [selectRefreshContext.lastRefresh]);

    useEffect(() => {
        if(sceneId){
            loadShots()
        }
    }, [sceneId])

    const setCreationLoaderVisibility = (visible:boolean) => {
        if(!creationLoaderRef.current) return

        creationLoaderRef.current.style.display = visible ? "block" : "none"
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

    const setCellRef = (row: number, column: number, value: CellRef | null) => {
        if (!cellRefs.current.has(row)) {
            cellRefs.current.set(row, new Map());
        }
        cellRefs.current.get(row)!.set(column, value);
    }

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

        setShots(result)

        console.log(result)
    }

    const createShot = async (attributePosition: number) => {
        setCreationLoaderVisibility(true)

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

        shotlistContext.setShotCount((shots.data.shots?.length || 0) + 1)

        const newShots = [...shots.data.shots || [], data.createShot]

        setShots({...shots, data: {...shots.data, shots: newShots}})

        setCreationLoaderVisibility(false)
    }

    if(shots.loading)
        return <Loader text={"Loading shots..."}/>

    if(shots.error)
        return <ErrorDisplay title={shots.error.message}/>

    return <div className="sheetManager">
        {(shots.data.shots as ShotDto[])?.map((shot: ShotDto, row: number) => (
            <Row key={shot.id}>
                <Cell
                    row={row}
                    column={-1}
                    type={["number"]}
                >
                    {Utils.numberToShotLetter(row)}
                </Cell>
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

        <div ref={creationLoaderRef} style={{display: "none"}}><Row>
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
        </Row></div>

        <Row>
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
        </Row>
    </div>
}