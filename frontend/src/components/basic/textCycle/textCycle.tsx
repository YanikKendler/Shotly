"use client"

import {useEffect, useRef, useState} from "react"
import "./textCycle.scss"

export default function TextCycle({
    text,
    animationDuration = 500,
    elementGap = 1.5,
    switchInterval = 2000,
    blurRadius = 3
}:{
    text: string[]
    animationDuration?: number
    elementGap?: number
    switchInterval?: number
    blurRadius?: number
}){
    const [shuffledText] = useState(() =>
        [...text].sort(() => Math.random() - 0.5)
    );

    const display1 = useRef<HTMLSpanElement>(null);
    const display2 = useRef<HTMLSpanElement>(null);

    const container = useRef<HTMLDivElement>(null);
    const currentDisplay = useRef<HTMLSpanElement>(null);
    const nextDisplay = useRef<HTMLSpanElement>(null);

    const cycle = useRef(-1);

    useEffect(() => {
        let timerId: NodeJS.Timeout;
        let isActive = true;

        const run = () => {
            if (!isActive) return;

            cycle.current = (cycle.current + 1) % shuffledText.length;
            showNext();

            setTimeout(flipDisplays, animationDuration+50);

            timerId = setTimeout(run, switchInterval);
        };

        setup();
        run();

        return () => {
            isActive = false;
            clearTimeout(timerId);
        };
    }, []);

    const setup = () => {
        if(!display1.current || !display2.current) return;

        currentDisplay.current = display1.current;
        nextDisplay.current = display2.current;
    }

    const showNext = () => {
        if(!currentDisplay.current || !nextDisplay.current || !container.current) return;

        currentDisplay.current.innerText = shuffledText[cycle.current];
        nextDisplay.current.innerText = shuffledText[(cycle.current + 1) % text.length];

        container.current.animate([
            {filter: "blur(0px)"},
            {filter: `blur(${blurRadius}px)`},
            {filter: "blur(0px)"}
        ], {duration: animationDuration})

        currentDisplay.current.animate([
            {translate: "0 0px"},
            {translate: `0 ${elementGap}em`}
        ], {duration: animationDuration, fill: "forwards", easing: "ease-in"})

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
            ref={container}
        >
            <span ref={display1}></span>
            <span ref={display2}></span>
        </span>
    )
}