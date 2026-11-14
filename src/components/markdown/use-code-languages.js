import { useEffect, useState } from 'react'

import { loadFenceLanguages } from './syntax-highlighting/preview-code-highlight'

export const useCodeLanguages = (text) => {
    const [loadedCount, setLoadedCount] = useState(0)

    useEffect(() => {
        if (!text) return

        let cancelled = false
        loadFenceLanguages(text).then((loaded) => {
            if (loaded && !cancelled) setLoadedCount((count) => count + 1)
        })

        return () => {
            cancelled = true
        }
    }, [text])

    return loadedCount
}
