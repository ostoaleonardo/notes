import { loadRepositoryData } from '../load-repository-data'
import { buildNotes, report } from '../../../../jest/perf-fixtures'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

jest.mock('expo-crypto', () => ({ randomUUID: () => 'id' }))

const SIZES = [1000, 3000, 5000]
const REPOSITORY = { id: 'repo', uri: 'file:///repo' }

const buildFileStorage = (notes) => {
    const contentByUri = new Map(notes.map((note) => [
        `file:///repo/${note.filename}`,
        `---\ntags:\n  - ${note.tags[0]}\n---\n\n${note.note}`
    ]))

    return {
        scanMarkdownFiles: async () => notes.map((note) => ({
            name: note.filename,
            uri: `file:///repo/${note.filename}`,
            lastModified: note.updatedAt
        })),
        readTextFiles: async (uris) => uris.map((uri) => contentByUri.get(uri)),
        findDirectory: () => null,
        migrateLegacyVersions: async () => {}
    }
}

const storage = {
    getItem: async (key) => (key.startsWith(STORAGE_KEYS.LEGACY_VERSIONS_MIGRATED_PREFIX) ? 'true' : null),
    setItem: async () => {},
    getAllKeys: async () => []
}

describe('repository loading', () => {
    const results = []

    test.each(SIZES)('loads %i notes with an in-memory file storage', async (count) => {
        const notes = buildNotes(count)
        const fileStorage = buildFileStorage(notes)

        const coldStart = performance.now()
        const cold = await loadRepositoryData([REPOSITORY], REPOSITORY, storage, fileStorage, [])
        const coldTime = performance.now() - coldStart

        const warmStart = performance.now()
        await loadRepositoryData([REPOSITORY], REPOSITORY, storage, fileStorage, cold.notes)
        const warmTime = performance.now() - warmStart

        results.push(
            `${String(count).padStart(5)} notes  cold ${coldTime.toFixed(0)} ms  ` +
            `reload with unchanged files ${warmTime.toFixed(0)} ms`
        )
    })

    afterAll(() => report('Repository loading, JS only (single run)', results))
})
