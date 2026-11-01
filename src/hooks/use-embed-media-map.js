import { useEffect, useMemo, useRef, useState } from 'react'

import { useMediaUris } from './use-media-uris'
import { resolveUrl } from './use-resolved-preview-markdown'
import { extractEmbedMediaNames } from '@/utils/embeds'
import { isEmbeddableMedia } from '@/utils/media-size'
import { logError } from '@/utils/log-error'

import { LOG_MESSAGES } from '@/constants/log-messages'

const EMPTY_MAP = new Map()

export const useEmbedMediaMap = (value, enabled, pdf = false) => {
    const listMediaUris = useMediaUris()
    const [map, setMap] = useState(EMPTY_MAP)
    const cacheRef = useRef(new Map())

    const namesKey = useMemo(
        () => (enabled ? extractEmbedMediaNames(value || '', { pdf }).join('\n') : ''),
        [value, enabled, pdf]
    )

    useEffect(() => {
        if (!namesKey) {
            setMap(EMPTY_MAP)
            return
        }

        let cancelled = false
        const cache = cacheRef.current
        const missing = namesKey.split('\n').filter((name) => !cache.has(name))
        const uris = missing.length ? listMediaUris() : EMPTY_MAP

        Promise.all(missing.map(async (name) => {
            const uri = uris.get(name)
            if (uri && isEmbeddableMedia(name, uri)) cache.set(name, await resolveUrl(uri))
        })).catch((error) => logError(LOG_MESSAGES.ERROR_RESOLVING_EMBEDDED_IMAGES, error)).then(() => {
            if (cancelled) return
            const names = namesKey.split('\n')
            setMap(new Map(names.map((name) => [name, cache.get(name) ?? null])))
        })

        return () => { cancelled = true }
    }, [namesKey, listMediaUris])

    return map
}
