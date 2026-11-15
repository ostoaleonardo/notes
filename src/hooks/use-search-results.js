import { useEffect, useMemo, useState } from 'react'

import { searchIndex } from '@/utils/search-index'
import { searchNotes } from '@/utils/search-filter'

const PENDING = { ast: null, notes: null, base: null }

export function useSearchResults({ enabled, ast, notes, notePaths, pinned, matchCase, sort }) {
    const [prepared, setPrepared] = useState(PENDING)

    useEffect(() => {
        if (!enabled) {
            setPrepared(PENDING)
            return
        }

        let cancelled = false

        searchIndex.findCandidates(ast, notes, notePaths).then((candidates) => {
            if (!cancelled) setPrepared({ ast, notes, base: candidates || notes })
        })

        return () => { cancelled = true }
    }, [enabled, ast, notes, notePaths])

    return useMemo(() => {
        if (!enabled || prepared === PENDING) return []

        const context = { pinned, notePaths, matchCase }

        return prepared.notes === notes
            ? searchNotes(prepared.base, prepared.ast, context, sort)
            : searchNotes(notes, ast, context, sort)
    }, [enabled, prepared, ast, notes, pinned, notePaths, matchCase, sort])
}
