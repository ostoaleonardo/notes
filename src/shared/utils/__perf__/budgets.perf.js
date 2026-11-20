import { collectTags, getNoteTags, seedNoteTags } from '../note-tags'
import { buildLinkGraph } from '../connection-model'
import { getNoteLinkTexts, seedNoteLinkTexts } from '../note-links'
import { buildRepositoryTree } from '@/features/drawer/utils/drawer-tree'
import { getNotePaths } from '../note-path'
import { mergeLoadedNotes } from '../merge-loaded-notes'
import { loadRepositoryData } from '../load-repository-data'
import { buildNotes, report } from '../../../../jest/perf-fixtures'
import { PERF_BUDGETS_MS, PERF_NOTE_COUNT } from '../../../../jest/perf-budgets'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

jest.mock('expo-crypto', () => ({ randomUUID: () => 'id' }))
jest.mock('repository-fs', () => ({ __esModule: true, default: {} }))

const REPOSITORY = { id: 'repo', uri: 'file:///repo', parentId: null }

const timeOnce = (fn) => {
    const start = performance.now()
    const result = fn()

    return { result, elapsed: performance.now() - start }
}

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

describe('startup budgets', () => {
    const rows = []

    const within = (label, elapsed, budget) => {
        rows.push(`${label.padEnd(24)} ${elapsed.toFixed(1).padStart(7)} ms  (budget ${budget} ms)`)
        expect(elapsed).toBeLessThan(budget)
    }

    afterAll(() => report(`Startup budgets, ${PERF_NOTE_COUNT} notes (Mac, JS only)`, rows))

    test('computes the tag list', () => {
        const notes = buildNotes(PERF_NOTE_COUNT)

        within('collectTags cold', timeOnce(() => collectTags(notes)).elapsed, PERF_BUDGETS_MS.collectTagsCold)
        within('collectTags warm', timeOnce(() => collectTags(notes)).elapsed, PERF_BUDGETS_MS.collectTagsWarm)
    })

    test('computes the tag list for notes restored from the index', () => {
        const source = buildNotes(PERF_NOTE_COUNT)
        const restored = source.map((note) => {
            const copy = { ...note }
            seedNoteTags(copy, getNoteTags(note))

            return copy
        })

        within(
            'collectTags seeded',
            timeOnce(() => collectTags(restored)).elapsed,
            PERF_BUDGETS_MS.collectTagsSeeded
        )
    })

    test('builds the link graph cold and from seeded link texts', () => {
        const notes = buildNotes(PERF_NOTE_COUNT)
        const notePaths = getNotePaths(notes, [REPOSITORY])
        const seeded = notes.map((note) => {
            const copy = { ...note }
            seedNoteLinkTexts(copy, getNoteLinkTexts(note))

            return copy
        })

        within(
            'link graph cold',
            timeOnce(() => buildLinkGraph({ notes, notePaths })).elapsed,
            PERF_BUDGETS_MS.linkGraphCold
        )
        within(
            'link graph seeded',
            timeOnce(() => buildLinkGraph({ notes: seeded, notePaths })).elapsed,
            PERF_BUDGETS_MS.linkGraphSeeded
        )
    })

    test('derives note paths', () => {
        const notes = buildNotes(PERF_NOTE_COUNT)

        within('notePaths', timeOnce(() => getNotePaths(notes, [REPOSITORY])).elapsed, PERF_BUDGETS_MS.notePaths)
    })

    test('builds the drawer tree', () => {
        const notes = buildNotes(PERF_NOTE_COUNT)
        const byRepository = new Map([[REPOSITORY.id, notes]])

        within(
            'repository tree',
            timeOnce(() => buildRepositoryTree([REPOSITORY], byRepository)).elapsed,
            PERF_BUDGETS_MS.repositoryTree
        )
    })

    test('merges the loaded notes with the current ones', () => {
        const snapshot = buildNotes(PERF_NOTE_COUNT)
        const loaded = buildNotes(PERF_NOTE_COUNT)
        const current = [...snapshot]

        within(
            'mergeLoadedNotes',
            timeOnce(() => mergeLoadedNotes(loaded, snapshot, [{ ...current[0] }, ...current.slice(1)])).elapsed,
            PERF_BUDGETS_MS.mergeLoadedNotes
        )
    })

    test('loads the repository cold and warm', async () => {
        const notes = buildNotes(PERF_NOTE_COUNT)
        const fileStorage = buildFileStorage(notes)

        const coldStart = performance.now()
        const cold = await loadRepositoryData([REPOSITORY], REPOSITORY, storage, fileStorage, [])
        within('load cold', performance.now() - coldStart, PERF_BUDGETS_MS.loadCold)

        const warmStart = performance.now()
        await loadRepositoryData([REPOSITORY], REPOSITORY, storage, fileStorage, cold.notes)
        within('load warm', performance.now() - warmStart, PERF_BUDGETS_MS.loadWarm)
    })
})
