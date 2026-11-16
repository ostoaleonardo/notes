import { useRef } from 'react'

const areMapsEqual = (a, b) => {
    if (a.size !== b.size) return false

    for (const [key, value] of a) {
        if (b.get(key) !== value) return false
    }

    return true
}

export const useStableMap = (map) => {
    const ref = useRef(map)

    if (ref.current !== map && !areMapsEqual(ref.current, map)) ref.current = map

    return ref.current
}
