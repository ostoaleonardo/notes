import { useCallback, useEffect, useRef } from 'react'

export function useTimer({ cancelOnUnmount = true } = {}) {
    const timerRef = useRef(null)

    const cancel = useCallback(() => {
        if (timerRef.current === null) return

        clearTimeout(timerRef.current)
        timerRef.current = null
    }, [])

    const schedule = useCallback((callback, delayMs) => {
        cancel()

        timerRef.current = setTimeout(() => {
            timerRef.current = null
            callback()
        }, delayMs)
    }, [cancel])

    const isPending = useCallback(() => timerRef.current !== null, [])

    useEffect(() => (cancelOnUnmount ? cancel : undefined), [cancelOnUnmount, cancel])

    return { schedule, cancel, isPending }
}
