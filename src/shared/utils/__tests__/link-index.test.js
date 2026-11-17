import { createLinkIndex } from '../link-index'
import { buildNotePath } from '../note-path'

jest.mock('repository-fs', () => ({ __esModule: true, default: {} }))

const buildNote = (name, body = '', updatedAt = 1) => ({
    path: buildNotePath('repo', `${name}.md`),
    filename: `${name}.md`,
    repositoryId: 'repo',
    title: name,
    note: body,
    updatedAt
})

const FILLER = Array.from({ length: 1000 }, (_, index) => buildNote(`filler${index}`, 'nothing'))
const NOTE_PATHS = new Map()

const refs = (...notes) => ({
    repositoryIds: notes.map(() => 'repo'),
    filenames: notes.map((note) => note.filename)
})

const build = ({ covered = () => true, backlinks = refs(), mentions = refs() } = {}) => {
    const backlinkCandidates = jest.fn(async () => backlinks)
    const mentionCandidates = jest.fn(async () => mentions)
    const index = createLinkIndex({
        coverage: { isCovered: covered },
        backlinkCandidates,
        mentionCandidates
    })

    return { index, backlinkCandidates, mentionCandidates }
}

describe('find backlinks through the index', () => {
    const target = buildNote('Target')
    const linker = buildNote('Linker', 'see [[Target]]')
    const hidden = buildNote('Hidden', 'see [[Target]]')

    test('verifies only the notes returned by the index', async () => {
        const { index, backlinkCandidates } = build({ backlinks: refs(linker) })
        const notes = [target, linker, hidden, ...FILLER]

        const found = await index.findBacklinks(target, notes, NOTE_PATHS)

        expect(found).toEqual([linker])
        expect(backlinkCandidates).toHaveBeenCalledWith(['Target'], target.path)
    })

    test('always checks notes that the index has not covered yet', async () => {
        const { index } = build({ covered: (note) => note !== hidden, backlinks: refs() })
        const notes = [target, linker, hidden, ...FILLER]

        const found = await index.findBacklinks(target, notes, NOTE_PATHS)

        expect(found).toEqual([hidden])
    })

    test('drops candidates that do not really resolve to the target', async () => {
        const decoy = buildNote('Decoy', 'see [[Other]]')
        const { index } = build({ backlinks: refs(decoy) })

        const found = await index.findBacklinks(target, [target, decoy, ...FILLER], NOTE_PATHS)

        expect(found).toEqual([])
    })

    test('scans every note when the collection is small', async () => {
        const { index, backlinkCandidates } = build()

        const found = await index.findBacklinks(target, [target, linker], NOTE_PATHS)

        expect(found).toEqual([linker])
        expect(backlinkCandidates).not.toHaveBeenCalled()
    })

    test('scans every note when too many notes are not covered', async () => {
        const { index, backlinkCandidates } = build({ covered: () => false })

        const found = await index.findBacklinks(target, [target, linker, ...FILLER], NOTE_PATHS)

        expect(found).toEqual([linker])
        expect(backlinkCandidates).not.toHaveBeenCalled()
    })

    test('falls back to a full scan when the index query fails', async () => {
        const { index, backlinkCandidates } = build()
        backlinkCandidates.mockRejectedValue(new Error('index unavailable'))

        const found = await index.findBacklinks(target, [target, linker, ...FILLER], NOTE_PATHS)

        expect(found).toEqual([linker])
    })

    test('passes the aliases of the target to the index', async () => {
        const aliased = { ...buildNote('Real'), properties: { aliases: ['Nick'] } }
        const { index, backlinkCandidates } = build()

        await index.findBacklinks(aliased, [aliased, ...FILLER], NOTE_PATHS)

        expect(backlinkCandidates).toHaveBeenCalledWith(['Real', 'Nick'], aliased.path)
    })

    test('scans every note when the target has no known names', async () => {
        const { index, backlinkCandidates } = build()

        await index.findBacklinks({ path: 'missing' }, [target, ...FILLER], NOTE_PATHS)

        expect(backlinkCandidates).not.toHaveBeenCalled()
    })
})

describe('select the candidate pool for mentions', () => {
    const notes = [buildNote('A'), buildNote('B'), ...FILLER]

    test('returns the paths from the index plus the uncovered notes', async () => {
        const { index } = build({ covered: (note) => note !== notes[1] })

        const pool = await index.selectPool(notes, async () => refs(notes[0]))

        expect([...pool]).toEqual([notes[1].path, notes[0].path])
    })

    test('returns null when the index asks for a full scan', async () => {
        const { index } = build()

        expect(await index.selectPool(notes, async () => null)).toBeNull()
    })
})
