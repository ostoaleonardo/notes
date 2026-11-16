import { useEffect, useMemo, useState } from 'react'

import { findPendingFenceLanguages } from './syntax-highlighting/preview-code-highlight'

export const useCodeLanguages = (text) => {
    const [loadedText, setLoadedText] = useState(null)
    const pending = useMemo(() => (text ? findPendingFenceLanguages(text) : []), [text])

    useEffect(() => {
        if (pending.length === 0) return

        let cancelled = false
        Promise.allSettled(pending.map((language) => language.load())).then(() => {
            if (!cancelled) setLoadedText(text)
        })

        return () => {
            cancelled = true
        }
    }, [pending, text])

    return pending.length === 0 || loadedText === text
}
