import { useMemo } from 'react'

import { useNotes } from './use-notes'
import { resolveWikiLinks } from '@/utils/wiki-links'

export const useResolvedWikiLinks = (value) => {
    const { notes } = useNotes()

    return useMemo(() => resolveWikiLinks(value || '', notes), [value, notes])
}
