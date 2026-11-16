import { useRef } from 'react'

import { useMediaUris } from './use-media-uris'
import { useNotes } from '../../../hooks/use-notes'
import { usePdfEmbed } from './use-pdf-embed'
import { useStableCallback } from './use-stable-callback'
import { resolveEmbedMedia } from '@/features/editor/utils/embed-media-resolver'
import { loadEmbedNotes } from '@/features/editor/utils/note-embeds'
import { resolveLocalUrls } from '@/features/editor/utils/local-url-resolver'
import { resolveUrl } from '@/features/editor/utils/resolve-url'

export function useEmbedLookup(selfId) {
    const pdf = usePdfEmbed()
    const listMediaUris = useMediaUris()
    const { notes, notePaths } = useNotes()

    const mediaCacheRef = useRef(new Map())
    const localCacheRef = useRef(new Map())

    const onResolveMedia = useStableCallback((names) => resolveEmbedMedia({
        names,
        pdf,
        listMediaUris,
        resolveUrl,
        cache: mediaCacheRef.current
    }))

    const onResolveLocalUrls = useStableCallback((urls) => resolveLocalUrls({
        urls,
        resolveUrl,
        cache: localCacheRef.current
    }))

    const onLoadEmbeds = useStableCallback(async (targets) => (
        loadEmbedNotes(targets, { notes, notePaths, selfPath: selfId })
    ))

    return { onResolveMedia, onResolveLocalUrls, onLoadEmbeds }
}
