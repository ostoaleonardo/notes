import { MARKDOWN_IMAGE_PATTERN, HTML_IMAGE_PATTERN } from '@/constants/markdown-patterns'

export const extractLocalUrls = (value) => {
    const urls = new Set()

    for (const match of value.matchAll(MARKDOWN_IMAGE_PATTERN)) urls.add(match[2])
    for (const match of value.matchAll(HTML_IMAGE_PATTERN)) urls.add(match[2])

    return [...urls]
}

export const replaceLocalImageUrls = (value, resolvedUrls) => (
    value
        .replace(
            MARKDOWN_IMAGE_PATTERN,
            (_, label, url) => `![${label}](${resolvedUrls.get(url) || url})`
        )
        .replace(
            HTML_IMAGE_PATTERN,
            (_, prefix, url, suffix) => `${prefix}${resolvedUrls.get(url) || url}${suffix}`
        )
)
