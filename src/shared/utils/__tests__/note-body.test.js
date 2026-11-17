import { createNoteBodyLoader } from '../note-body'
import { bodyOf, splitBody } from '../note-body-of'

jest.mock('repository-fs', () => ({ __esModule: true, default: {} }))

const bodyless = (name, updatedAt = 1) => ({
    path: `repo::${name}.md`,
    fileUri: `file:///${name}.md`,
    updatedAt
})

const build = (files = {}, maxNotes) => {
    const readTextFiles = jest.fn(async (uris) => uris.map((uri) => files[uri] ?? null))

    return { loader: createNoteBodyLoader({ readTextFiles, maxNotes }), readTextFiles }
}

describe('split a note body from its file content', () => {
    test('removes the frontmatter block', () => {
        expect(splitBody('---\nstatus: open\n---\n\nBody')).toBe('Body')
    })

    test('keeps content without frontmatter as it is', () => {
        expect(splitBody('Just text')).toBe('Just text')
    })
})

describe('body of a note', () => {
    test('prefers a loaded body, then the resident one, then an empty text', () => {
        const note = { path: 'a', note: 'resident' }

        expect(bodyOf(note, new Map([['a', 'loaded']]))).toBe('loaded')
        expect(bodyOf(note)).toBe('resident')
        expect(bodyOf({ path: 'b' })).toBe('')
    })
})

describe('load note bodies on demand', () => {
    test('reads the file and strips the frontmatter', async () => {
        const { loader } = build({ 'file:///a.md': '---\nx: 1\n---\n\nHello' })

        expect(await loader.get(bodyless('a'))).toBe('Hello')
    })

    test('returns resident bodies without reading any file', async () => {
        const { loader, readTextFiles } = build()
        const bodies = await loader.load([{ ...bodyless('a'), note: 'in memory' }])

        expect(bodies.get('repo::a.md')).toBe('in memory')
        expect(readTextFiles).not.toHaveBeenCalled()
    })

    test('reads each file once while it stays cached', async () => {
        const { loader, readTextFiles } = build({ 'file:///a.md': 'A' })

        await loader.get(bodyless('a'))
        await loader.get(bodyless('a'))

        expect(readTextFiles).toHaveBeenCalledTimes(1)
    })

    test('reads again when the note changed on disk', async () => {
        const { loader, readTextFiles } = build({ 'file:///a.md': 'A' })

        await loader.get(bodyless('a', 1))
        await loader.get(bodyless('a', 2))

        expect(readTextFiles).toHaveBeenCalledTimes(2)
    })

    test('reads only the missing notes of a batch', async () => {
        const { loader, readTextFiles } = build({ 'file:///a.md': 'A', 'file:///b.md': 'B' })

        await loader.get(bodyless('a'))
        const bodies = await loader.load([bodyless('a'), bodyless('b')])

        expect(readTextFiles).toHaveBeenLastCalledWith(['file:///b.md'])
        expect([...bodies.values()]).toEqual(['A', 'B'])
    })

    test('evicts the least recently used body', async () => {
        const { loader, readTextFiles } = build({ 'file:///a.md': 'A', 'file:///b.md': 'B' }, 1)

        await loader.get(bodyless('a'))
        await loader.get(bodyless('b'))
        await loader.get(bodyless('a'))

        expect(readTextFiles).toHaveBeenCalledTimes(3)
    })

    test('treats an unreadable file as an empty body', async () => {
        const { loader } = build({})

        expect(await loader.get(bodyless('gone'))).toBe('')
    })
})
