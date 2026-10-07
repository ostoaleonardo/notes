import { useEffect, useMemo, useRef, useState } from 'react'

import { useImageUris } from './use-image-uris'
import { resolveUrl } from './use-resolved-preview-markdown'
import { extractEmbedImageNames } from '@/utils/embeds'
import { logError } from '@/utils/log-error'

import { LOG_MESSAGES } from '@/constants/log-messages'

const EMPTY_MAP = new Map()

export const useEmbedImageMap = (value, enabled) => {
    const listImageUris = useImageUris()
    const [map, setMap] = useState(EMPTY_MAP)
    const cacheRef = useRef(new Map())

    const namesKey = useMemo(
        () => (enabled ? extractEmbedImageNames(value || '').join('\n') : ''),
        [value, enabled]
    )

    useEffect(() => {
        if (!namesKey) {
            setMap(EMPTY_MAP)
            return
        }

        let cancelled = false
        const cache = cacheRef.current
        const missing = namesKey.split('\n').filter((name) => !cache.has(name))
        const uris = missing.length ? listImageUris() : EMPTY_MAP

        Promise.all(missing.map(async (name) => {
            const uri = uris.get(name)
            if (uri) cache.set(name, await resolveUrl(uri))
        })).catch((error) => logError(LOG_MESSAGES.ERROR_RESOLVING_EMBEDDED_IMAGES, error)).then(() => {
            if (cancelled) return
            const names = namesKey.split('\n')
            setMap(new Map(names.map((name) => [name, cache.get(name) ?? null])))
        })

        return () => { cancelled = true }
    }, [namesKey, listImageUris])

    return map
}
