import { useCallback, useMemo } from 'react'
import { Directory, File } from 'expo-file-system'

import { useNotes } from './use-notes'
import { useRepositories } from './use-repositories'
import { resolveWikiLinks } from '@/utils/wiki-links'
import { resolveEmbeds } from '@/utils/embeds'
import { getNotePaths } from '@/utils/note-path'

export const useResolvedWikiLinks = (value, selfPath) => {
    const { notes } = useNotes()
    const { repositories, activeRepository, ensureImagesFolder } = useRepositories()

    const notePaths = useMemo(() => getNotePaths(notes, repositories), [notes, repositories])

    const listImageUris = useCallback(() => (
        new Map(
            new Directory(ensureImagesFolder(activeRepository))
                .list()
                .filter((entry) => entry instanceof File)
                .map((entry) => [entry.name, entry.uri])
        )
    ), [activeRepository, ensureImagesFolder])

    return useMemo(() => {
        let imageUris = null

        const getImageUrl = (name) => {
            imageUris ??= listImageUris()
            return imageUris.get(name)
        }

        const withEmbeds = resolveEmbeds(value || '', { notes, notePaths, getImageUrl, selfPath })
        return resolveWikiLinks(withEmbeds, notes, notePaths)
    }, [value, selfPath, notes, notePaths, listImageUris])
}
