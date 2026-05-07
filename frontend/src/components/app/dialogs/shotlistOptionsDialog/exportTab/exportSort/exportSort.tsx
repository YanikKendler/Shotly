import {ArrowRight, GripVertical, X} from "lucide-react"
import {ExportSortOrder} from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/exportTab"
import "./exportSort.scss"
import SimpleTooltip from "@/components/basic/tooltip/simpleTooltip"

export default function ExportSort({
    name,
    order,
    onReverseOrder,
    onRemove
}:{
    name: string,
    order: ExportSortOrder
    onReverseOrder: () => void
    onRemove: () => void

}) {

    const orderLetters = ["A", "Z"]

    if(order == "descending") orderLetters.reverse()

    return (
        <div className="setting sort">
            <div className="left">
                <div className="grip">
                    <GripVertical size={22}/>
                </div>
                {/*<Icon size={22} strokeWidth={3}/>*/}
                {/*<span className={"number"}>{number + 1}</span>*/}
                <p>{name}</p>
                {/*<Separator orientation={"vertical"}/>*/}
                <SimpleTooltip content={<><span className="bold">click</span> to toggle</>} delay={800}>
                    <button
                        onClick={onReverseOrder}
                        className={"order default"}
                    >
                        {order.toUpperCase()}
                        <div className="details">
                            <span className="small">{orderLetters[0]}</span>
                            <ArrowRight size={16}/>
                            <span className="small">{orderLetters[1]}</span>
                        </div>
                    </button>
                </SimpleTooltip>
            </div>

            <div className="right">
                <button
                    className="remove bad"
                    onClick={onRemove}
                >
                    <X size={18}/>
                </button>
            </div>
        </div>
    )
}