import { useMemo } from 'react'

import { useNotes } from './use-notes'
import { useRepositories } from './use-repositories'
import { resolveWikiLinks } from '@/utils/wiki-links'
import { getNotePaths } from '@/utils/note-path'

export const useResolvedWikiLinks = (value) => {
    const { notes } = useNotes()
    const { repositories } = useRepositories()

    const notePaths = useMemo(() => getNotePaths(notes, repositories), [notes, repositories])

    return useMemo(() => resolveWikiLinks(value || '', notes, notePaths), [value, notes, notePaths])
}
