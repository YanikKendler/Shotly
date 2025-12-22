import {Slider as RdxSlider} from "radix-ui"
import "./slider.scss"

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
        <RdxSlider.Root
            className="SliderRoot"
            value={[value]}
            min={min}
            max={max}
            step={step}
            onValueChange={value => onChange(value[0])}
        >
            <div className="SliderMarkers">
                {Array.from({length: markerCount}).map((_, index) => (
                    <span className="marker" key={index}/>
                ))}
            </div>
            <RdxSlider.Track className="SliderTrack">
                <RdxSlider.Range className="SliderRange"/>
            </RdxSlider.Track>
            <RdxSlider.Thumb className="SliderThumb" aria-label={name}/>
        </RdxSlider.Root>
    )
}