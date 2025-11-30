import {useContext, useEffect, useState} from "react"
import gql from "graphql-tag"
import {ShotlistContext} from "@/context/ShotlistContext";
import {ApolloQueryResult, NetworkStatus, useApolloClient} from "@apollo/client"
import Loader from "@/components/loader/loader"
import ErrorDisplay from "@/components/errorDisplay/errorDisplay"
import "./sheetManager.scss"
import {ShotDto} from "../../../../lib/graphql/generated"
import Row from "@/components/spreadsheet/row/row"
import ShotAttribute from "@/components/shotAttribute/shotAttribute"
import {AnyShotAttribute} from "@/util/Types"
import Utils from "@/util/Utils"
import Cell from "@/components/spreadsheet/cell/cell"
import CellTextInput from "@/components/spreadsheet/cell/input/cellTextInput/cellTextInput"
import CellSingleSelectInput from "@/components/spreadsheet/cell/input/cellSingleSelectInput/cellSingleSelectInput"
import CellMultiSelectInput from "@/components/spreadsheet/cell/input/cellMultiSelectInput/cellMultiSelectInput"

/**
 * Query's shots based on the passed sceneId and displays them in a spreadsheet, handles all spreadsheet actions
 * @param sceneId
 * @constructor
 */
export default function SheetManager({
    sceneId
}:{
    sceneId: string
}){
    const shotlistContext = useContext(ShotlistContext)
    const client = useApolloClient()

    const [shots, setShots] = useState<ApolloQueryResult<any>>(Utils.defaultQueryResult)

    useEffect(() => {
        if(sceneId){
            loadShots()
        }
    }, [sceneId]);

    const loadShots = async () => {
        const { data, errors, loading, networkStatus } = await client.query({
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

        shotlistContext.setShotCount(data.shots.length || 0)

        setShots({data: data.shots, loading: loading, errors: errors, networkStatus: networkStatus})
    }

    const renderInputForAttribute = (attribute: AnyShotAttribute) => {
        switch (attribute.__typename) {
            case "ShotTextAttributeDTO":
                return <CellTextInput attribute={attribute}/>
            case "ShotSingleSelectAttributeDTO":
                return <CellSingleSelectInput attribute={attribute}/>
            case "ShotMultiSelectAttributeDTO":
                return <CellMultiSelectInput attribute={attribute}/>
            default:
                return <p>unknown attribute - please report this as a bug</p>
        }
    }

    if(shots.loading)
        return <Loader text={"Loading shots..."}/>

    if(shots.error)
        return <ErrorDisplay text={shots.error.message}/>

    return <div className="sheetManager">
        {shots.data.map((shot: ShotDto, index: number) => (
            <Row key={shot.id}>
                <Cell type={"number"}>{index}</Cell>
                {(shot.attributes as AnyShotAttribute[]).map((attribute: AnyShotAttribute)=> (
                    <Cell key={attribute.id}>{renderInputForAttribute(attribute)}</Cell>
                ))}
            </Row>
        ))}
    </div>
}