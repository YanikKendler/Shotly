"use client"

import Image from "next/image"
import React, {useEffect, useRef} from "react"
import {tinykeys} from "@/../node_modules/tinykeys/dist/tinykeys" //package has incorrectly configured type exports
import Dialog, {DialogRef} from "@/components/basic/dialog/dialog"

export default function Ralph(){
    const dialogRef = useRef<DialogRef>(null);

    useEffect(() => {
        let unsubscribe = tinykeys(window, {
            "S h o t l y": event => {
                setTimeout(() => {
                    dialogRef.current?.open()
                },50)
            }
        })
        return () => {
            unsubscribe()
        }
    }, [])

    return (
        <Dialog ref={dialogRef}>
            <Image src={"/ralph-wave.gif"} alt={"Ralph Wave.. sorry you dont get to see this"} width={410} height={310}/>
        </Dialog>
    )
}