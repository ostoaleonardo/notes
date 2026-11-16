import { useEffect, useMemo, useState } from 'react'

import { useNotes } from './use-notes'
import { useMediaUris } from './use-media-uris'
import { parseEmbedMedia } from '@/utils/embed-media'
import { extractEmbedMediaNames, resolveEmbeds } from '@/utils/embeds'
import { isEmbeddableMedia } from '@/utils/media-size'

import { EMBED_OPENING } from '@/constants/embeds'
import { FILE_KINDS } from '@/constants/file-types'

export const useResolvedEmbeds = (value, selfPath, pdfSetting = false) => {
    const { notes, notePaths } = useNotes()
    const listMediaUris = useMediaUris()
    const [mediaUris, setMediaUris] = useState(null)

    const hasEmbeds = useMemo(() => (value || '').includes(EMBED_OPENING), [value])
    const pdf = pdfSetting && hasEmbeds

    const hasMedia = useMemo(
        () => extractEmbedMediaNames(value || '', { pdf: true }).length > 0,
        [value]
    )

    useEffect(() => {
        if (!hasMedia) return undefined

        let cancelled = false

        listMediaUris().then((uris) => {
            if (!cancelled) setMediaUris(uris)
        })

        return () => { cancelled = true }
    }, [hasMedia, listMediaUris])

    return useMemo(() => {
        const getMediaUrl = (name) => {
            const uri = mediaUris?.get(name)
            if (!pdf && parseEmbedMedia(name).kind === FILE_KINDS.PDF) return undefined

            return uri && isEmbeddableMedia(name, uri) ? uri : undefined
        }

        return resolveEmbeds(value || '', {
            notes,
            notePaths,
            getMediaUrl,
            selfPath,
            withOpenLink: true
        })
    }, [value, selfPath, pdf, notes, notePaths, mediaUris])
}
