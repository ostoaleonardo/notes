import { EMBED_VIDEO_FRAME_FRAGMENT } from '@/constants/embeds'
import { MARKDOWN_IMAGE_PATTERN, HTML_IMAGE_PATTERN, HTML_MEDIA_PATTERN, HTML_PDF_PATTERN } from '@/constants/markdown-patterns'

export const extractLocalUrls = (value) => {
    const urls = new Set()

    for (const match of value.matchAll(MARKDOWN_IMAGE_PATTERN)) urls.add(match[2])
    for (const match of value.matchAll(HTML_IMAGE_PATTERN)) urls.add(match[2])
    for (const match of value.matchAll(HTML_MEDIA_PATTERN)) urls.add(match[2])
    for (const match of value.matchAll(HTML_PDF_PATTERN)) urls.add(match[2])

    return [...urls]
}

export const replaceLocalImageUrls = (value, resolvedUrls) => {
    const replaceHtmlUrl = (_, prefix, url, suffix) => `${prefix}${resolvedUrls.get(url) || url}${suffix}`

    return value
        .replace(
            MARKDOWN_IMAGE_PATTERN,
            (_, label, url) => `![${label}](${resolvedUrls.get(url) || url})`
        )
        .replace(HTML_IMAGE_PATTERN, replaceHtmlUrl)
        .replace(HTML_PDF_PATTERN, replaceHtmlUrl)
        .replace(HTML_MEDIA_PATTERN, (_, prefix, url, suffix) => {
            const fragment = prefix.startsWith('<video') ? EMBED_VIDEO_FRAME_FRAGMENT : ''

            return `${prefix}${resolvedUrls.get(url) || url}${fragment}${suffix}`
        })
}
