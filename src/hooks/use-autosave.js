import { useCallback, useEffect, useRef } from 'react'

export function useAutosave(
    onSave, deps, { delay = 500, skip = false } = {}
) {
    const onSaveRef = useRef(onSave)
    onSaveRef.current = onSave

    const timerRef = useRef(null)

    useEffect(() => {
        if (skip) return

        timerRef.current = setTimeout(() => {
            timerRef.current = null
            onSaveRef.current()
        }, delay)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skip, delay, ...deps])

    const flush = useCallback(async () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }

        await onSaveRef.current()
    }, [])

    return { flush }
}
