import { parseEmbedMedia } from './embed-media'
import { isEmbeddableMedia } from './media-size'

import { FILE_KINDS } from '@/constants/file-types'

const isAllowed = (name, pdf) => pdf || parseEmbedMedia(name).kind !== FILE_KINDS.PDF

export const resolveEmbedMedia = async ({ names, pdf, listMediaUris, resolveUrl, cache }) => {
    const wanted = names.filter((name) => isAllowed(name, pdf))
    const missing = wanted.filter((name) => !cache.has(name))

    if (missing.length) {
        const uris = await listMediaUris()

        await Promise.all(missing.map(async (name) => {
            const uri = uris.get(name)
            if (uri && isEmbeddableMedia(name, uri)) cache.set(name, await resolveUrl(uri))
        }))
    }

    return Object.fromEntries(names.map((name) => [name, wanted.includes(name) ? cache.get(name) ?? null : null]))
}
