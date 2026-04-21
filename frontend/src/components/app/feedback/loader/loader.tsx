import React from "react"
import "./loader.scss"
import TextCycle from "@/components/basic/textCycle/textCycle"

export default function Loader({
    text,
    scale = 1,
    mt
}: {
    text?: string | string[]
    scale?: number
    mt?: string
}) {
    return (
        <div className="loader" style={{marginTop: mt}}>
            <svg
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="24px"
                height="30px"
                viewBox="0 0 24 30"
                style={{
                    transform: `scale(${scale})`,
                }}
            >
                <rect
                    x="0" y="0" width="4" height="10" rx="2" ry="2"
                    className="bar-animation"
                    style={{ animationDelay: '0s' }}
                />
                <rect
                    x="10" y="0" width="4" height="10" rx="2" ry="2"
                    className="bar-animation"
                    style={{ animationDelay: '0.2s' }}
                />
                <rect
                    x="20" y="0" width="4" height="10" rx="2" ry="2"
                    className="bar-animation"
                    style={{ animationDelay: '0.4s' }}
                />
            </svg>
            <p style={{
                marginTop: `${2 * scale}rem`,
            }}>
                {
                    !text ?
                        "loading.." :
                    Array.isArray(text) ?
                        <TextCycle text={text} switchInterval={1200}/> :
                        text
                }
            </p>
        </div>
    );
}