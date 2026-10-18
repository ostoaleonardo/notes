import { useEffect, useState } from 'react'

export function useDelayedValue(value, delay) {
    const [delayed, setDelayed] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDelayed(value), delay)

        return () => clearTimeout(timer)
    }, [value, delay])

    return delayed
}
