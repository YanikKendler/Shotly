"use client"

import {memo, useEffect, useRef, useState} from "react"
import "./textCycle.scss"

export interface TextCycleProps {
    text: string[]
    animationDuration?: number
    elementGap?: number
    switchInterval?: number
    blurRadius?: number
    shuffled?: boolean
}

function TextCycle({
    text,
    animationDuration = 500,
    elementGap = 1.5,
    switchInterval = 2000,
    blurRadius = 3,
    shuffled = true,
}: TextCycleProps){
    const [shuffledText] = useState(() =>
        shuffled ? [...text].sort(() => Math.random() - 0.5) : [...text]
    );

    const display1 = useRef<HTMLSpanElement>(null);
    const display2 = useRef<HTMLSpanElement>(null);

    const root = useRef<HTMLDivElement>(null);
    const container = useRef<HTMLDivElement>(null);
    const currentDisplay = useRef<HTMLSpanElement>(null);
    const nextDisplay = useRef<HTMLSpanElement>(null);

    const cycle = useRef(0);

    useEffect(() => {
        if(!shuffledText) return

        let timerId: NodeJS.Timeout;
        let isActive = true;

        const run = () => {
            if (!isActive) return;

            showNext();
            cycle.current = (cycle.current + 1) % shuffledText.length;

            setTimeout(flipDisplays, animationDuration+50);

            timerId = setTimeout(run, switchInterval);
        };

        setup();
        timerId = setTimeout(run, switchInterval);

        console.log("execute")

        return () => {
            isActive = false;
            clearTimeout(timerId);
        };
    }, [shuffledText]);

    const setup = () => {
        if(!display1.current || !display2.current || !root.current) return;

        currentDisplay.current = display1.current;
        nextDisplay.current = display2.current;

        currentDisplay.current.innerText = shuffledText[cycle.current]

        root.current.style.width = currentDisplay.current.clientWidth + "px"
    }

    const showNext = () => {
        if(!currentDisplay.current || !nextDisplay.current || !container.current || !root.current) return;

        currentDisplay.current.innerText = shuffledText[cycle.current];
        nextDisplay.current.innerText = shuffledText[(cycle.current + 1) % text.length];

        //blur container
        container.current.animate([
            {filter: "blur(0px)"},
            {filter: `blur(${blurRadius}px)`},
            {filter: "blur(0px)"}
        ], {duration: animationDuration})

        root.current.animate([
            {width: nextDisplay.current.clientWidth + "px"}
        ], {duration: animationDuration, fill: "forwards"})

        //move current display down
        currentDisplay.current.animate([
            {translate: "0 0px"},
            {translate: `0 ${elementGap}em`}
        ], {duration: animationDuration, fill: "forwards", easing: "ease-in"})

        //move next display in
        nextDisplay.current.animate([
            {translate: `0 -${elementGap}em`},
            {translate: "0px 0px"}
        ], {duration: animationDuration, fill: "forwards", easing: "ease-in"})
    }

    const flipDisplays = () => {
        const temp = currentDisplay.current;
        currentDisplay.current = nextDisplay.current;
        nextDisplay.current = temp;
    }

    return (
        <span
            className="textCycle"
            ref={root}
        >
            <span
                className="cycleContainer"
                ref={container}
            >
                <span className={"textDisplay"} ref={display1}></span>
                <span className={"textDisplay"} ref={display2}></span>
            </span>
        </span>
    )
}

export default memo(TextCycle, () => true);