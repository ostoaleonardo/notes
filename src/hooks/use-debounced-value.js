import { useEffect, useState } from 'react'

import { useTimer } from './use-timer'

export function useDebouncedValue(value, delay, isImmediate) {
    const { schedule, cancel } = useTimer()

    const [debounced, setDebounced] = useState(value)
    const immediate = isImmediate?.(value) ?? false

    useEffect(() => {
        if (immediate) {
            cancel()
            setDebounced(value)
            return
        }

        schedule(() => setDebounced(value), delay)
    }, [
        value,
        delay,
        immediate,
        schedule,
        cancel
    ])

    return immediate ? value : debounced
}
