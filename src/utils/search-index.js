import { openDatabaseAsync } from 'expo-sqlite'
import RepositoryFs from 'repository-fs'

import { buildNotePath } from '@/utils/note-path'
import { buildPrefilter, compilePrefilter } from '@/utils/search-prefilter'
import { logError } from '@/utils/log-error'

import { LOG_MESSAGES } from '@/constants/log-messages'
import { SEARCH_INDEX_CANDIDATE_RATIO, SEARCH_INDEX_MIN_NOTES } from '@/constants/search-index'

export const createSearchIndex = ({ openDatabase, listIndexedNotes }) => {
    let covered = new WeakSet()
    let database = null

    const getDatabase = () => {
        database ??= openDatabase()
        return database
    }

    const refresh = async (notes) => {
        const { repositoryIds, filenames, modified } = await listIndexedNotes()
        const indexed = new Map(filenames.map((filename, index) => [
            buildNotePath(repositoryIds[index], filename),
            modified[index]
        ]))

        covered = new WeakSet(notes.filter((note) => indexed.get(note.path) === note.updatedAt))
    }

    const findCandidates = async (ast, notes, notePaths) => {
        if (notes.length < SEARCH_INDEX_MIN_NOTES) return null

        const folders = new Set([...notePaths.values()].map((folder) => folder.toLowerCase()))
        const tree = buildPrefilter(ast, folders)
        if (!tree) return null

        const limit = Math.floor(notes.length * SEARCH_INDEX_CANDIDATE_RATIO)
        const { sql, params } = compilePrefilter(tree)

        try {
            const rows = await (await getDatabase()).getAllAsync(sql, ...params, limit + 1)
            if (rows.length > limit) return null

            const hits = new Set(rows.map(({ repositoryId, filename }) => buildNotePath(repositoryId, filename)))

            return notes.filter((note) => hits.has(note.path) || !covered.has(note))
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_SEARCHING_INDEX, error)
            return null
        }
    }

    return { refresh, findCandidates }
}

export const searchIndex = createSearchIndex({
    openDatabase: () => openDatabaseAsync(RepositoryFs.indexDatabaseName, { useNewConnection: true }),
    listIndexedNotes: () => RepositoryFs.listIndexedNotes()
})
