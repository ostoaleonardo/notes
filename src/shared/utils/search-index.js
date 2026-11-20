import { queryIndex } from '@/shared/utils/index-query'
import { buildNotePath } from '@/shared/utils/note-path'
import { createIndexCoverage, indexCoverage } from '@/shared/utils/index-coverage'
import { getNoteComparator } from '@/shared/utils/note-sort'
import { buildPrefilter, compilePage } from '@/shared/utils/search-prefilter'
import {
    SEARCH_DATABASE_MAX_PAGES,
    SEARCH_DATABASE_PAGE_SIZE,
    SEARCH_INDEX_MIN_NOTES,
    SEARCH_INDEX_UNCOVERED_RATIO
} from '@/shared/constants/search-index'

export class SourceOverflowError extends Error {}

export const createSearchIndex = ({
    query,
    listIndexedNotes,
    coverage = createIndexCoverage({ listIndexedNotes })
}) => {
    const { refresh, isCovered } = coverage

    const createSource = ({ ast, notes, notePaths, sort }) => {
        if (notes.length < SEARCH_INDEX_MIN_NOTES) return null

        const uncovered = notes.filter((note) => !isCovered(note))
        if (uncovered.length > notes.length * SEARCH_INDEX_UNCOVERED_RATIO) return null

        const folders = new Set([...notePaths.values()].map((folder) => folder.toLowerCase()))
        const tree = buildPrefilter(ast, folders)
        if (!tree) return null

        const notesByPath = new Map(notes.map((note) => [note.path, note]))
        const compare = getNoteComparator(sort)
        const pending = uncovered.sort(compare)

        let cursor = null
        let exhausted = false
        let pendingIndex = 0
        let pages = 0

        const flushBefore = (batch, note) => {
            while (pendingIndex < pending.length && compare(pending[pendingIndex], note) < 0) {
                batch.push(pending[pendingIndex])
                pendingIndex += 1
            }
        }

        return {
            nextBatch: async () => {
                if (exhausted && pendingIndex >= pending.length) return null

                const batch = []

                if (!exhausted) {
                    if (pages >= SEARCH_DATABASE_MAX_PAGES) throw new SourceOverflowError()

                    pages += 1

                    const { sql, params } = compilePage({ tree, sort, cursor, size: SEARCH_DATABASE_PAGE_SIZE })
                    const rows = await query(sql, ...params)

                    exhausted = rows.length < SEARCH_DATABASE_PAGE_SIZE
                    cursor = rows.length ? rows.at(-1) : cursor

                    rows.forEach(({ folderId, filename }) => {
                        const note = notesByPath.get(buildNotePath(folderId, filename))
                        if (!note || !isCovered(note)) return

                        flushBefore(batch, note)
                        batch.push(note)
                    })
                }

                if (exhausted) {
                    batch.push(...pending.slice(pendingIndex))
                    pendingIndex = pending.length
                }

                return batch
            }
        }
    }

    return { refresh, createSource }
}

export const searchIndex = createSearchIndex({
    query: queryIndex,
    coverage: indexCoverage
})
