import {ReactNode} from "react"
import "./cell.scss"

/**
 * Represents a single cell in the spreadsheet aka a shot attribute
 * @param children
 * @param type the purpose of the cell, affects styling - default or number(shot number on the left)
 * @constructor
 */
export default function Cell({
    children,
    type = "default"
}:{
    children: ReactNode,
    type?: "default" | "number"
}){
    return <div className={`sheetCell ${type}`}>
        {children}
    </div>
}