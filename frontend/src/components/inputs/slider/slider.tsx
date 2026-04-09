import {Slider as RdxSlider} from "radix-ui"
import "./slider.scss"
import React from "react"
import SimpleTooltip from "@/components/tooltip/simpleTooltip"

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
            <SimpleTooltip text={"Double click to reset"} delay={1000}>
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
            </SimpleTooltip>
    )
}