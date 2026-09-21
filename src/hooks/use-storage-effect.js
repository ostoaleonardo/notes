import { useEffect } from 'react'

import { useStorage } from './use-storage'

export function useStorageEffect(key, onValue) {
    const { getItem } = useStorage()

    useEffect(() => {
        if (!key) return

        let cancelled = false

        getItem(key).then((value) => {
            if (!cancelled) onValue(value)
        })

        return () => { cancelled = true }
    }, [key])
}
