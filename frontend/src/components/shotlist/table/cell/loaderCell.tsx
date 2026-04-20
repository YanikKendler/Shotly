import CellBase from "@/components/shotlist/table/cell/cellBase"
import Skeleton from "react-loading-skeleton"

export default function LoaderCell ({
    isNumber = false,
}:{
    isNumber?: boolean
}) {

    return (
        <CellBase
            className={`loader`}
            isNumber={isNumber}
        >
            <Skeleton height={"calc(40px * var(--shotlist-scale))"}/>
        </CellBase>
    )
}