import { useEffect, useRef, useState } from 'react'
import { File } from 'expo-file-system'

import { bytesToBase64 } from '@/utils/base64'
import { extractLocalUrls, replaceLocalImageUrls } from '@/utils/local-images'

import { MIME_TYPES } from '@/constants/mime-types'
import { MAX_PREVIEW_IMAGE_CACHE } from '@/constants/image'

const EMPTY_MEDIA_MAP = new Map()

export const resolveUrl = async (url) => {
    try {
        const file = new File(url)
        const bytes = await file.bytes()
        const mime = file.type || MIME_TYPES.JPEG
        return `data:${mime};base64,${bytesToBase64(bytes)}`
    } catch {
        return url
    }
}

export const useResolvedPreviewMarkdown = (value) => {
    const [resolved, setResolved] = useState(value)
    const [mediaMap, setMediaMap] = useState(EMPTY_MEDIA_MAP)
    const cacheRef = useRef(new Map())

    useEffect(() => {
        const urls = extractLocalUrls(value)

        if (urls.length === 0) {
            setResolved(value)
            setMediaMap(EMPTY_MEDIA_MAP)
            return
        }

        let cancelled = false
        const cache = cacheRef.current

        Promise.all(urls.map(async (url) => (
            [url, cache.has(url) ? cache.get(url) : await resolveUrl(url)]
        ))).then((pairs) => {
            if (cancelled) return

            const resolvedUrls = new Map(pairs)
            resolvedUrls.forEach((dataUrl, url) => {
                cache.delete(url)
                cache.set(url, dataUrl)
            })
            while (cache.size > MAX_PREVIEW_IMAGE_CACHE) cache.delete(cache.keys().next().value)
            setMediaMap(resolvedUrls)

            setResolved(replaceLocalImageUrls(value, resolvedUrls))
        })

        return () => { cancelled = true }
    }, [value])

    return { value: resolved, mediaMap }
}
