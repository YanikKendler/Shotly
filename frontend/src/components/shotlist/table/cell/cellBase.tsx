import {ReactNode} from "react"
import "./cell.scss"

export default function CellBase({
    children,
    isNumber = false,
    className = "",
    onClick = () => {},
    onFocus = () => {},
    onBlur = () => {}
}: {
    children: ReactNode
    isNumber?: boolean
    className?: string
    onClick?: () => void
    onFocus?: () => void
    onBlur?: () => void
}){
    return (
        <div
            className={`sheetCell ${isNumber && "number"} ${className}`}
            onClick={onClick}
            onFocus={onFocus}
            onBlur={onBlur}
        >
            {children}
        </div>
    )
}