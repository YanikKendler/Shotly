import {Checkbox} from "radix-ui"
import {Check} from "lucide-react"
import {useEffect, useState} from "react"
import "./labeledCheckbox.scss"

export default function LabeledCheckbox({text, defaultChecked, onCheckedChange}:{text: string, defaultChecked: boolean, onCheckedChange: (checked: boolean) => void}) {
    const [isChecked, setIsChecked] = useState(false)

    useEffect(() => {
        setIsChecked(defaultChecked)
    }, [defaultChecked]);

    function handleCheckedChange(newChecked: boolean) {
        setIsChecked(newChecked)
        onCheckedChange(newChecked)
    }

    return (
        <div className={"labeledCheckbox"} onClick={() => handleCheckedChange(!isChecked)}>
            <Checkbox.Root
                className="CheckboxRoot"
                checked={isChecked}
                onCheckedChange={handleCheckedChange}
            >
                <Checkbox.Indicator className="CheckboxIndicator">
                    <Check size={20} strokeWidth={3}/>
                </Checkbox.Indicator>
            </Checkbox.Root>
            <label>{text}</label>
        </div>
    );
}