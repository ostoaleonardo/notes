import { useState } from 'react'

import { useBlockLoader } from './use-block-loader'
import { useNoteEntries } from './use-note-entries'
import { useStableCallback } from './use-stable-callback'
import { resolveLinkDetails, resolveLinkTargets, searchNoteEntries } from '@/features/editor/utils/note-entries'

export function useNoteLookup(selfId) {
    const entries = useNoteEntries()
    const [tracked, setTracked] = useState({ entries, version: 0 })

    if (tracked.entries !== entries) {
        setTracked({ entries, version: tracked.version + 1 })
    }

    const onResolveLinks = useStableCallback(async (targets) => resolveLinkTargets(entries, targets))
    const onResolveLinkDetails = useStableCallback(async (targets) => (
        resolveLinkDetails(entries, targets, selfId)
    ))
    const onSearchNotes = useStableCallback(async (query) => searchNoteEntries(entries, query))
    const onLoadBlocks = useBlockLoader(selfId, entries)

    return {
        linkVersion: tracked.version,
        onResolveLinks,
        onResolveLinkDetails,
        onSearchNotes,
        onLoadBlocks
    }
}
