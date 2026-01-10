import {Popover, Tooltip} from "radix-ui"
import {Info} from "lucide-react"
import React, {useCallback, useEffect, useRef, useState} from "react"
import "./textField.scss"
import {wuGeneral} from "@yanikkendler/web-utils/dist"

/**
 * simple input wrapper for use in static UIs like settings pages
 * @param label
 * @param value
 * @param defaultValue
 * @param valueChange
 * @param placeholder
 * @param info
 * @param disabled
 * @param maxLength
 * @param maxWidth
 * @param inputClass
 * @param showError
 * @param debounceValueChange
 * @constructor
 */
export default function TextField(
    {
        label,
        value,
        defaultValue = "",
        valueChange = () => {},
        placeholder = "",
        info,
        disabled = false,
        maxLength = 255,
        maxWidth = "40ch",
        inputClass = "",
        showLengthError = true,
        debounceValueChange = false,
        autoComplete = true
    }
    :
    {
        label?: string;
        value?: string;
        defaultValue?: string;
        valueChange?: (value: string) => void;
        placeholder?: string;
        info?: string;
        disabled?: boolean;
        maxLength?: number;
        maxWidth?: string;
        inputClass?: string;
        showLengthError?: boolean;
        debounceValueChange?: boolean;
        autoComplete?: boolean;
    }
) {
    const [currentValue, setCurrentValue] = useState<string>(value || defaultValue);
    const [error, setError] = useState<string>("");
    const [errorType, setErrorType] = useState<"warning" | "max">("warning");

    useEffect(() => {
        if (value == undefined) return
        validateInput(value)
        setCurrentValue(value)
    }, [value])

    useEffect(() => {
        if(currentValue != "") return
        validateInput(defaultValue)
        setCurrentValue(defaultValue)
    }, [defaultValue])

    const debouncedValueChange = useCallback(
        wuGeneral.debounce(valueChange),
        [valueChange]
    )

    function validateInput(value: string) {
        setError("")

        if(!showLengthError) return

        if(value.length > maxLength - 10) {
            setError(`${value.length}/${maxLength} characters`);
        }

        if(value.length >= maxLength) {
            setError(`${value.length}/${maxLength} characters reached`)
            setErrorType("max")
            return;
        }
        else {
            setErrorType("warning");
        }
    }

    function handleInput(value: string){
        if(disabled) return

        validateInput(value)
        setCurrentValue(value)

        if(debounceValueChange && debouncedValueChange)
            debouncedValueChange(value)
        else
            valueChange(value)
    }

    const ignoreProps = !autoComplete ? {
        "autoComplete": "new-password",
        "data-lpignore": "true",     // LastPass
        "data-bwignore": "true",     // Bitwarden
        "data-1p-ignore": "true",    // 1Password
        "data-form-type": "other",   // Dashlane
        name: `field_${Math.random().toString(36).substring(7)}`, // Random name prevents matching
    } : {};

    return (
        <div className="textField">
            {
                label &&
                <label htmlFor={label}>{label}</label>
            }
            <div className="infoContainer">
                <div className="errorContainer" style={{maxWidth: maxWidth}}>
                    <input
                        id={label}
                        type="text"
                        placeholder={placeholder}
                        value={currentValue}
                        onInput={e => handleInput(e.currentTarget.value)}
                        maxLength={maxLength}
                        disabled={disabled}
                        className={inputClass}
                        style={{maxWidth: maxWidth}}
                        {...ignoreProps}
                    />
                    <p className={"error " + errorType}>{error}</p>
                </div>
                {
                    info &&
                    <Popover.Root>
                        <Popover.Trigger className={"noPadding"}>
                            <Info/>
                        </Popover.Trigger>
                        <Popover.Portal>
                            <Popover.Content className={"PopoverContent"}>
                                <Popover.Arrow/>
                                <p>{info}</p>
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>
                }
            </div>
        </div>
    );
}