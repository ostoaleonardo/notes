import { useRef } from 'react'

export const useStableValue = (value) => {
    const ref = useRef(null)

    if (!ref.current) {
        ref.current = { value, json: JSON.stringify(value) }
    } else if (ref.current.value !== value) {
        const json = JSON.stringify(value)

        if (json !== ref.current.json) ref.current = { value, json }
    }

    return ref.current.value
}
