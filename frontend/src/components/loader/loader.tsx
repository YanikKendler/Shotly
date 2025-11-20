import Image from "next/image"
import React from "react"
import "./loader.scss"

export default function Loader({text, scale = 1}: { text?: string, scale?: number }) {
    return (
        <div className="loader">
            <svg
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="24px"
                height="30px"
                viewBox="0 0 24 30"
                style={{scale: scale}}
            >
                <rect x="0" y="0" width="4" height="10" fill="#333" rx="2" ry="2">
                    <animateTransform attributeName="transform" type="translate"
                                      values="0 0; 0 20; 0 0" begin="0s" dur="0.6s" repeatCount="indefinite"/>
                </rect>
                <rect x="10" y="0" width="4" height="10" fill="#333" rx="2" ry="2">
                    <animateTransform attributeName="transform" type="translate"
                                      values="0 0; 0 20; 0 0" begin="0.2s" dur="0.6s" repeatCount="indefinite"/>
                </rect>
                <rect x="20" y="0" width="4" height="10" fill="#333" rx="2" ry="2">
                    <animateTransform attributeName="transform" type="translate"
                                      values="0 0; 0 20; 0 0" begin="0.4s" dur="0.6s" repeatCount="indefinite"/>
                </rect>
            </svg>
            <p style={{marginTop: 2*scale+"rem"}}>{text || "loading.."}</p>
        </div>
    );
}