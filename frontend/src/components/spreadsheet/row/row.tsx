import {ReactNode} from "react"
import "./row.scss"

/**
 * Represents a single row in the spreadsheet aka a shot
 * @param children
 * @constructor
 */
export default function Row({
    children,
}:{
    children: ReactNode
}){
    return <div className="sheetRow">
        {children}
    </div>
}