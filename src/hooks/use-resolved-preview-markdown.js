import { useEffect, useRef, useState } from 'react'
import { File } from 'expo-file-system'

import { bytesToBase64 } from '@/utils/base64'

const MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(((?:file|content):\/\/[^)]+)\)/g
const HTML_IMAGE_PATTERN = /(<img[^>]*\bsrc=["'])((?:file|content):\/\/[^"']+)(["'])/g
const EMPTY_MEDIA_MAP = new Map()

const extractLocalUrls = (value) => {
    const urls = new Set()

    for (const match of value.matchAll(MARKDOWN_IMAGE_PATTERN)) urls.add(match[2])
    for (const match of value.matchAll(HTML_IMAGE_PATTERN)) urls.add(match[2])

    return [...urls]
}

const resolveUrl = async (url) => {
    try {
        const file = new File(url)
        const bytes = await file.bytes()
        const mime = file.type || 'image/jpeg'
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
            resolvedUrls.forEach((dataUrl, url) => cache.set(url, dataUrl))
            setMediaMap(resolvedUrls)

            const withMarkdownResolved = value.replace(
                MARKDOWN_IMAGE_PATTERN,
                (_, label, url) => `![${label}](${resolvedUrls.get(url) || url})`
            )

            setResolved(withMarkdownResolved.replace(
                HTML_IMAGE_PATTERN,
                (_, prefix, url, suffix) => `${prefix}${resolvedUrls.get(url) || url}${suffix}`
            ))
        })

        return () => { cancelled = true }
    }, [value])

    return { value: resolved, mediaMap }
}
