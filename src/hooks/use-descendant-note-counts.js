import { useEffect, useRef, useState } from 'react'

import { getRepositoryNoteCount } from '@/utils/repository-note-counts'

import { REPOSITORY_COUNT_BATCH } from '@/constants/repository-counts'

export function useDescendantNoteCounts(descendants, listMarkdownFiles, enabled) {
    const cache = useRef({})
    const [counts, setCounts] = useState({})
    const [pending, setPending] = useState(false)

    useEffect(() => {
        if (!enabled) return undefined

        setCounts({ ...cache.current })
        setPending(descendants.length > 0)

        let index = 0
        let task

        const step = () => {
            descendants
                .slice(index, index + REPOSITORY_COUNT_BATCH)
                .forEach(({ id, uri }) => {
                    cache.current[id] = getRepositoryNoteCount(uri, listMarkdownFiles)
                })

            index += REPOSITORY_COUNT_BATCH
            setCounts({ ...cache.current })

            if (index < descendants.length) {
                task = requestIdleCallback(step)
            } else {
                setPending(false)
            }
        }

        task = requestIdleCallback(step)

        return () => cancelIdleCallback(task)
    }, [enabled, descendants, listMarkdownFiles])

    return { counts, loading: pending && Object.keys(counts).length === 0 }
}
