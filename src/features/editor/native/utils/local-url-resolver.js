import { MAX_PREVIEW_IMAGE_CACHE } from '@/shared/constants/image'

export const resolveLocalUrls = async ({ urls, resolveUrl, cache }) => {
    const entries = await Promise.all(urls.map(async (url) => (
        [url, cache.has(url) ? cache.get(url) : await resolveUrl(url)]
    )))

    entries.forEach(([url, resolved]) => {
        cache.delete(url)
        cache.set(url, resolved)
    })

    while (cache.size > MAX_PREVIEW_IMAGE_CACHE) cache.delete(cache.keys().next().value)

    return Object.fromEntries(entries)
}
