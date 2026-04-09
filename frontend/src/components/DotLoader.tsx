import {useEffect, useRef, useState} from "react"
import {Timeout} from "@radix-ui/primitive"

export default function DotLoader({
    showText = false
}: {
    showText?: boolean;
}) {
    const dotCount = useRef(0);
    const dotElementRef = useRef<HTMLSpanElement>(null);
    const timeOutRef = useRef<Timeout>(null)

    useEffect(() => {
        if(timeOutRef.current)
            clearInterval(timeOutRef.current)

        timeOutRef.current = setInterval(() => {
            dotCount.current = (dotCount.current + 1) % 4;

            let dots = ""

            for (let i = 0; i < dotCount.current; i++) {
                dots += "."
            }

            if(dotElementRef.current)
                dotElementRef.current.innerText = dots;
        }, 500);
    }, []);

    return <span>
        {!showText ? "" : "Loading"}
        <span style={{width: "1.5ch", display: "inline-block"}} ref={dotElementRef}/>
    </span>;
}