'use client'

import {useScreenWidth} from "@/utility/useScreenWidth"

export default function ViewPortSwitcher({
    breakpoint,
    under,
    over
}: {
    breakpoint: number
    under?: React.ReactElement | string
    over?: React.ReactElement | string
}) {
    const width = useScreenWidth()

    if(width > breakpoint)
        return over
    else
        return under
}