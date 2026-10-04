import { useMemo } from 'react'

import { useNotes } from './use-notes'
import { useImageUris } from './use-image-uris'
import { resolveWikiLinks } from '@/utils/wiki-links'
import { resolveEmbeds } from '@/utils/embeds'

export const useResolvedWikiLinks = (value, selfPath) => {
    const { notes, notePaths } = useNotes()
    const listImageUris = useImageUris()

    return useMemo(() => {
        let imageUris = null

        const getImageUrl = (name) => {
            imageUris ??= listImageUris()
            return imageUris.get(name)
        }

        const withEmbeds = resolveEmbeds(value || '', { notes, notePaths, getImageUrl, selfPath })
        return resolveWikiLinks(withEmbeds, notes, notePaths, selfPath)
    }, [value, selfPath, notes, notePaths, listImageUris])
}
