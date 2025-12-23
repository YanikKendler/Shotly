import {Slider as RdxSlider, Tooltip} from "radix-ui"
import "./slider.scss"
import Link from "next/link"
import {wuGeneral} from "@yanikkendler/web-utils"
import {House} from "lucide-react"
import React from "react"

export default function Slider({
    name,
    min,
    max,
    step,
    value,
    markerCount = 0,
    onChange
}: {
    name: string,
    min: number,
    max: number,
    step: number,
    value: number,
    markerCount: number,
    onChange: (value: number) => void
}){
    return (
        <Tooltip.Root delayDuration={1000}>
            <Tooltip.Trigger asChild>
                <RdxSlider.Root
                    className="SliderRoot"
                    value={[value]}
                    min={min}
                    max={max}
                    step={step}
                    onValueChange={value => onChange(value[0])}
                    onClick={e => {
                        if(e.detail === 2){
                            onChange((min + max) / 2)
                        }
                    }}
                >
                    <div className="SliderMarkers">
                        {Array.from({length: markerCount}).map((_, index) => (
                            <span className="marker" key={index}/>
                        ))}
                    </div>
                    <div className="SliderNumbers">
                        <span className="number">{min}</span>
                        <span className="number">{max}</span>
                    </div>
                    <RdxSlider.Track className="SliderTrack">
                        <RdxSlider.Range className="SliderRange"/>
                    </RdxSlider.Track>
                    <RdxSlider.Thumb
                        className="SliderThumb"
                        aria-label={name}
                    />
                </RdxSlider.Root>
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content className={"TooltipContent"}>
                    <Tooltip.Arrow/>
                    <p>Double click to reset</p>
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    )
}