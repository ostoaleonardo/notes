import { useEffect, useRef } from 'react'

import { useStorage } from './use-storage'

export function useStorageEffect(key, onValue) {
    const { getItem } = useStorage()
    const onValueRef = useRef(onValue)
    onValueRef.current = onValue

    useEffect(() => {
        if (!key) return

        let cancelled = false

        getItem(key).then((value) => {
            if (!cancelled) onValueRef.current(value)
        })

        return () => { cancelled = true }
    }, [key, getItem])
}
