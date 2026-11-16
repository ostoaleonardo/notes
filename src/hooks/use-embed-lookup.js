import { useRef } from 'react'

import { useMediaUris } from './use-media-uris'
import { useNotes } from './use-notes'
import { usePdfEmbed } from './use-pdf-embed'
import { resolveUrl } from './use-resolved-preview-markdown'
import { useStableCallback } from './use-stable-callback'
import { resolveEmbedMedia } from '@/utils/embed-media-resolver'
import { loadEmbedNotes } from '@/utils/note-embeds'
import { resolveLocalImages } from '@/utils/resolve-local-images'

export function useEmbedLookup(selfId) {
    const pdf = usePdfEmbed()
    const listMediaUris = useMediaUris()
    const { notes, notePaths } = useNotes()

    const cacheRef = useRef(new Map())

    const onResolveMedia = useStableCallback((names) => resolveEmbedMedia({
        names,
        pdf,
        listMediaUris,
        resolveUrl,
        cache: cacheRef.current
    }))

    const onLoadEmbeds = useStableCallback(async (targets) => {
        const loaded = loadEmbedNotes(targets, { notes, notePaths, selfPath: selfId })

        await Promise.all(Object.values(loaded).filter(Boolean).map(async (embed) => {
            embed.text = await resolveLocalImages(embed.text, resolveUrl)
        }))

        return loaded
    })

    return { onResolveMedia, onLoadEmbeds }
}
