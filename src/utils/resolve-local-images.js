import { extractLocalUrls, replaceLocalImageUrls } from './local-images'

export const resolveLocalImages = async (text, resolveUrl) => {
    const urls = extractLocalUrls(text)

    if (!urls.length) return text

    const pairs = await Promise.all(urls.map(async (url) => [url, await resolveUrl(url)]))

    return replaceLocalImageUrls(text, new Map(pairs))
}
