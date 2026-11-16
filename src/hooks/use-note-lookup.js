import { useState } from 'react'

import { useBlockLoader } from './use-block-loader'
import { useNoteEntries } from './use-note-entries'
import { useStableCallback } from './use-stable-callback'
import { resolveLinkTargets, searchNoteEntries } from '@/utils/note-entries'

export function useNoteLookup(selfId) {
    const entries = useNoteEntries()
    const [tracked, setTracked] = useState({ entries, version: 0 })

    if (tracked.entries !== entries) {
        setTracked({ entries, version: tracked.version + 1 })
    }

    const onResolveLinks = useStableCallback(async (targets) => resolveLinkTargets(entries, targets))
    const onSearchNotes = useStableCallback(async (query) => searchNoteEntries(entries, query))
    const onLoadBlocks = useBlockLoader(selfId, entries)

    return { linkVersion: tracked.version, onResolveLinks, onSearchNotes, onLoadBlocks }
}
