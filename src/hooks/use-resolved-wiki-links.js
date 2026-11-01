import { useMemo } from 'react'

import { useNotes } from './use-notes'
import { useMediaUris } from './use-media-uris'
import { resolveWikiLinks } from '@/utils/wiki-links'
import { resolveEmbeds } from '@/utils/embeds'
import { isEmbeddableMedia } from '@/utils/media-size'

export const useResolvedWikiLinks = (value, selfPath) => {
    const { notes, notePaths } = useNotes()
    const listMediaUris = useMediaUris()

    return useMemo(() => {
        let mediaUris = null

        const getMediaUrl = (name) => {
            mediaUris ??= listMediaUris()
            const uri = mediaUris.get(name)

            return uri && isEmbeddableMedia(name, uri) ? uri : undefined
        }

        const withEmbeds = resolveEmbeds(value || '', {
            notes,
            notePaths,
            getMediaUrl,
            selfPath,
            withOpenLink: true
        })
        return resolveWikiLinks(withEmbeds, notes, notePaths, selfPath)
    }, [value, selfPath, notes, notePaths, listMediaUris])
}
