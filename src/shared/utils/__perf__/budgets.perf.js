import { collectTags, getNoteTags, seedNoteTags } from '../note-tags'
import { buildLinkGraph } from '../connection-model'
import { getNoteLinkTexts, seedNoteLinkTexts } from '../note-links'
import { buildFolderTree } from '@/features/drawer/utils/drawer-tree'
import { getNotePaths } from '../note-path'
import { mergeLoadedNotes } from '../merge-loaded-notes'
import { loadRepositoryData } from '../load-repository-data'
import { buildNotes, report } from '../../../../jest/perf-fixtures'
import { PERF_BUDGETS_MS, PERF_NOTE_COUNT, PERF_SAMPLES } from '../../../../jest/perf-budgets'

import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

jest.mock('expo-crypto', () => ({ randomUUID: () => 'id' }))
jest.mock('repository-fs', () => ({ __esModule: true, default: {} }))

const REPOSITORY = { id: 'repo', uri: 'file:///repo', parentId: null }

const timeBest = (prepare, run) => {
    const samples = Array.from({ length: PERF_SAMPLES }, () => {
        const input = prepare()
        const start = performance.now()
        run(input)

        return performance.now() - start
    })

    return Math.min(...samples)
}

const timeWarm = (input, run) => {
    run(input)

    return timeBest(() => input, run)
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
        const cold = timeBest(() => buildNotes(PERF_NOTE_COUNT), collectTags)
        const warm = timeWarm(buildNotes(PERF_NOTE_COUNT), collectTags)

        within('collectTags cold', cold, PERF_BUDGETS_MS.collectTagsCold)
        within('collectTags warm', warm, PERF_BUDGETS_MS.collectTagsWarm)
    })

    test('computes the tag list for notes restored from the index', () => {
        const restore = () => buildNotes(PERF_NOTE_COUNT).map((note) => {
            const copy = { ...note }
            seedNoteTags(copy, getNoteTags(note))

            return copy
        })

        within(
            'collectTags seeded',
            timeBest(restore, collectTags),
            PERF_BUDGETS_MS.collectTagsSeeded
        )
    })

    test('builds the link graph cold and from seeded link texts', () => {
        const prepare = (seed) => () => {
            const notes = buildNotes(PERF_NOTE_COUNT).map((note) => {
                const copy = { ...note }
                if (seed) seedNoteLinkTexts(copy, getNoteLinkTexts(note))

                return copy
            })

            return { notes, notePaths: getNotePaths(notes, [REPOSITORY]) }
        }

        within('link graph cold', timeBest(prepare(false), buildLinkGraph), PERF_BUDGETS_MS.linkGraphCold)
        within('link graph seeded', timeBest(prepare(true), buildLinkGraph), PERF_BUDGETS_MS.linkGraphSeeded)
    })

    test('derives note paths', () => {
        const elapsed = timeBest(
            () => buildNotes(PERF_NOTE_COUNT),
            (notes) => getNotePaths(notes, [REPOSITORY])
        )

        within('notePaths', elapsed, PERF_BUDGETS_MS.notePaths)
    })

    test('builds the drawer tree', () => {
        const elapsed = timeBest(
            () => new Map([[REPOSITORY.id, buildNotes(PERF_NOTE_COUNT)]]),
            (byFolder) => buildFolderTree([REPOSITORY], byFolder)
        )

        within('repository tree', elapsed, PERF_BUDGETS_MS.folderTree)
    })

    test('merges the loaded notes with the current ones', () => {
        const prepare = () => {
            const snapshot = buildNotes(PERF_NOTE_COUNT)

            return {
                loaded: buildNotes(PERF_NOTE_COUNT),
                snapshot,
                current: [{ ...snapshot[0] }, ...snapshot.slice(1)]
            }
        }

        within(
            'mergeLoadedNotes',
            timeBest(prepare, ({ loaded, snapshot, current }) => mergeLoadedNotes(loaded, snapshot, current)),
            PERF_BUDGETS_MS.mergeLoadedNotes
        )
    })

    test('loads the folder cold and warm', async () => {
        const timeBestAsync = async (run) => {
            const samples = []

            for (let sample = 0; sample < PERF_SAMPLES; sample++) {
                const start = performance.now()
                await run()
                samples.push(performance.now() - start)
            }

            return Math.min(...samples)
        }

        const fileStorage = buildFileStorage(buildNotes(PERF_NOTE_COUNT))
        const load = (known) => loadRepositoryData([REPOSITORY], REPOSITORY, storage, fileStorage, known)
        const { notes: loaded } = await load([])

        within('load cold', await timeBestAsync(() => load([])), PERF_BUDGETS_MS.loadCold)
        within('load warm', await timeBestAsync(() => load(loaded)), PERF_BUDGETS_MS.loadWarm)
    })

})
