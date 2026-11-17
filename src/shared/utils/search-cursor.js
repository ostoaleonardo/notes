import { filterNotes } from '@/shared/utils/search-filter'
import { getNoteComparator } from '@/shared/utils/note-sort'
import { sortInChunks } from '@/shared/utils/sort-in-chunks'
import { yieldToUi } from '@/shared/utils/yield-to-ui'

import { SEARCH_SCAN_CHUNK_SIZE } from '@/shared/constants/search-scan'

const sortedCache = new WeakMap()

const getSortedNotes = (notes, sort) => {
    let bySort = sortedCache.get(notes)

    if (!bySort) {
        bySort = new Map()
        sortedCache.set(notes, bySort)
    }

    if (!bySort.has(sort)) bySort.set(sort, sortInChunks(notes, getNoteComparator(sort)))

    return bySort.get(sort)
}

export const createMemorySource = (notes, sort, chunkSize = SEARCH_SCAN_CHUNK_SIZE) => {
    let position = 0

    return {
        nextBatch: async () => {
            const sorted = await getSortedNotes(notes, sort)

            if (position >= sorted.length) return null

            const batch = sorted.slice(position, position + chunkSize)
            position += chunkSize

            return batch
        }
    }
}

export const createSearchCursor = ({
    source,
    ast,
    context,
    yieldFn = yieldToUi,
    isCancelled = () => false,
    loadBodies = async () => undefined
}) => {
    let exhausted = false
    const buffer = []

    const next = async (target, onProgress) => {
        const found = []

        const take = () => {
            const part = buffer.splice(0, target - found.length)
            if (!part.length) return

            found.push(...part)
            onProgress?.(part)
        }

        take()

        while (!exhausted && found.length < target) {
            if (isCancelled()) return null

            const batch = await source.nextBatch()

            if (!batch) {
                exhausted = true
                break
            }

            const bodies = await loadBodies(batch)
            if (isCancelled()) return null

            buffer.push(...filterNotes(batch, ast, { ...context, bodies }))
            take()

            await yieldFn()
        }

        return { found, done: exhausted && buffer.length === 0 }
    }

    return { next }
}
