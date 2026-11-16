import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'

import { useMediaUris } from './use-media-uris'
import { resolveUrl } from './use-resolved-preview-markdown'
import { extractEmbedMediaNames } from '@/utils/embeds'
import { resolveEmbedMedia } from '@/utils/embed-media-resolver'
import { logError } from '@/utils/log-error'

import { EMBED_OPENING } from '@/constants/embeds'
import { LOG_MESSAGES } from '@/constants/log-messages'

const EMPTY_MAP = new Map()

export const useEmbedMediaMap = (value, enabled, pdfSetting = false) => {
    const listMediaUris = useMediaUris()
    const [map, setMap] = useState(EMPTY_MAP)
    const cacheRef = useRef(new Map())

    const deferredValue = useDeferredValue(value)
    const pdf = pdfSetting && (deferredValue || '').includes(EMBED_OPENING)

    const namesKey = useMemo(
        () => (enabled ? extractEmbedMediaNames(deferredValue || '', { pdf }).join('\n') : ''),
        [deferredValue, enabled, pdf]
    )

    useEffect(() => {
        if (!namesKey) {
            setMap(EMPTY_MAP)
            return
        }

        let cancelled = false
        const cache = cacheRef.current
        const missing = namesKey.split('\n').filter((name) => !cache.has(name))

        const resolveMissing = () => (
            missing.length
                ? resolveEmbedMedia({ names: missing, pdf: true, listMediaUris, resolveUrl, cache })
                : Promise.resolve()
        )

        resolveMissing().catch((error) => logError(LOG_MESSAGES.ERROR_RESOLVING_EMBEDDED_IMAGES, error)).then(() => {
            if (cancelled) return
            const names = namesKey.split('\n')
            setMap(new Map(names.map((name) => [name, cache.get(name) ?? null])))
        })

        return () => { cancelled = true }
    }, [namesKey, listMediaUris])

    return map
}
