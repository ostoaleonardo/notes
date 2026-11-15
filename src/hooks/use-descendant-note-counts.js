import { useEffect, useRef, useState } from 'react'

import { getRepositoryNoteCount } from '@/utils/repository-note-counts'

import { REPOSITORY_COUNT_BATCH } from '@/constants/repository-counts'

export function useDescendantNoteCounts(descendants, scanMarkdownFiles, enabled) {
    const cache = useRef({})
    const [counts, setCounts] = useState({})
    const [pending, setPending] = useState(false)

    useEffect(() => {
        if (!enabled) return undefined

        setCounts({ ...cache.current })
        setPending(descendants.length > 0)

        let cancelled = false

        const countAll = async () => {
            for (let index = 0; index < descendants.length; index += REPOSITORY_COUNT_BATCH) {
                const batch = descendants.slice(index, index + REPOSITORY_COUNT_BATCH)

                const batchCounts = await Promise.all(batch.map(({ uri }) => (
                    getRepositoryNoteCount(uri, scanMarkdownFiles)
                )))
                if (cancelled) return

                batch.forEach(({ id }, position) => {
                    cache.current[id] = batchCounts[position]
                })
                setCounts({ ...cache.current })
            }

            setPending(false)
        }

        countAll()

        return () => { cancelled = true }
    }, [enabled, descendants, scanMarkdownFiles])

    return { counts, loading: pending && Object.keys(counts).length === 0 }
}
