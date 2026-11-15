import RepositoryFs from 'repository-fs'

import { queryIndex } from '@/utils/index-query'
import { buildNotePath } from '@/utils/note-path'
import { getNoteComparator } from '@/utils/note-sort'
import { buildPrefilter, compilePage } from '@/utils/search-prefilter'
import {
    SEARCH_DATABASE_MAX_PAGES,
    SEARCH_DATABASE_PAGE_SIZE,
    SEARCH_INDEX_MIN_NOTES,
    SEARCH_INDEX_UNCOVERED_RATIO
} from '@/constants/search-index'

export class SourceOverflowError extends Error {}

export const createSearchIndex = ({ query, listIndexedNotes }) => {
    let covered = new WeakSet()

    const refresh = async (notes) => {
        const { repositoryIds, filenames, modified } = await listIndexedNotes()
        const indexed = new Map(filenames.map((filename, index) => [
            buildNotePath(repositoryIds[index], filename),
            modified[index]
        ]))

        covered = new WeakSet(notes.filter((note) => indexed.get(note.path) === note.updatedAt))
    }

    const createSource = ({ ast, notes, notePaths, sort }) => {
        if (notes.length < SEARCH_INDEX_MIN_NOTES) return null

        const uncovered = notes.filter((note) => !covered.has(note))
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

                    rows.forEach(({ repositoryId, filename }) => {
                        const note = notesByPath.get(buildNotePath(repositoryId, filename))
                        if (!note || !covered.has(note)) return

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
    listIndexedNotes: () => RepositoryFs.listIndexedNotes()
})
