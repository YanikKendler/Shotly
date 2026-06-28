import {useRef} from "react"

export default function useWhenReady(){
    const isReady = useRef(false);
    const queue = useRef<(() => void)[]>([])

    const ready = () => {
        if(isReady.current == false) {
            let fun
            while (fun = queue.current.pop()) {
                fun()
            }
            isReady.current = true
        }
    }

    const execute = (then: () => void) => {
        if(isReady.current == true)
            then()
        else
            queue.current.push(then)
    }

    return {
        execute,
        ready
    }
}