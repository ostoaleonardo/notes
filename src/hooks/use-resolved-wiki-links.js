import { useMemo } from 'react'

import { useNotes } from './use-notes'
import { useMediaUris } from './use-media-uris'
import { resolveWikiLinks } from '@/utils/wiki-links'
import { parseEmbedMedia } from '@/utils/embed-media'
import { resolveEmbeds } from '@/utils/embeds'
import { isEmbeddableMedia } from '@/utils/media-size'

import { FILE_KINDS } from '@/constants/file-types'

export const useResolvedWikiLinks = (value, selfPath, pdf = false) => {
    const { notes, notePaths } = useNotes()
    const listMediaUris = useMediaUris()

    return useMemo(() => {
        let mediaUris = null

        const getMediaUrl = (name) => {
            mediaUris ??= listMediaUris()
            const uri = mediaUris.get(name)
            if (!pdf && parseEmbedMedia(name).kind === FILE_KINDS.PDF) return undefined

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
    }, [value, selfPath, pdf, notes, notePaths, listMediaUris])
}
