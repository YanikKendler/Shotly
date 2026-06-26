'use client'

import {useScreenWidth} from "@/utility/useScreenWidth"
import {ReactNode} from "react"

export default function ViewPortSwitcher({
    breakpoint,
    under,
    over
}: {
    breakpoint: number
    under?: ReactNode | string
    over?: ReactNode | string
}) {
    const width = useScreenWidth()

    if(width > breakpoint)
        return over
    else
        return under
}