import { useEffect, useState } from 'react'

export function useDeferredReady() {
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const task = requestIdleCallback(() => setReady(true))

        return () => cancelIdleCallback(task)
    }, [])

    return ready
}
