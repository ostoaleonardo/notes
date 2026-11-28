import { createNoteBodyLoader } from '../note-body'
import { bodyOf, splitBody } from '../note-body-of'

jest.mock('repository-engine', () => ({ __esModule: true, default: {} }))

const bodyless = (name, updatedAt = 1) => ({
    path: `repo::${name}.md`,
    fileUri: `file:///${name}.md`,
    updatedAt
})

const build = (files = {}, maxNotes, maxPinned) => {
    const readTextFiles = jest.fn(async (uris) => uris.map((uri) => files[uri] ?? null))

    return {
        loader: createNoteBodyLoader({ readTextFiles, maxNotes, maxPinned }),
        readTextFiles
    }
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

describe('pin the body a note was opened with', () => {
    test('serves the pinned body without reading the file', async () => {
        const { loader, readTextFiles } = build({ 'file:///a.md': 'changed on disk' })

        loader.pin(bodyless('a'), 'as opened')

        expect(await loader.get(bodyless('a'))).toBe('as opened')
        expect(readTextFiles).not.toHaveBeenCalled()
    })

    test('peeks only resident or pinned bodies of the same version', () => {
        const { loader } = build()

        loader.pin(bodyless('a', 1), 'as opened')

        expect(loader.peek(bodyless('a', 1))).toBe('as opened')
        expect(loader.peek(bodyless('a', 2))).toBeUndefined()
        expect(loader.peek(bodyless('b'))).toBeUndefined()
        expect(loader.peek({ ...bodyless('c'), note: 'resident' })).toBe('resident')
    })

    test('never trusts a cached disk read as a base body', async () => {
        const { loader } = build({ 'file:///a.md': 'A' })

        await loader.get(bodyless('a'))

        expect(loader.peek(bodyless('a'))).toBeUndefined()
    })

    test('keeps a pinned body while cached bodies are evicted', async () => {
        const { loader } = build({ 'file:///b.md': 'B', 'file:///c.md': 'C' }, 1)

        loader.pin(bodyless('a'), 'as opened')
        await loader.get(bodyless('b'))
        await loader.get(bodyless('c'))

        expect(loader.peek(bodyless('a'))).toBe('as opened')
    })

    test('drops the oldest pin beyond the limit', () => {
        const { loader } = build({}, undefined, 1)

        loader.pin(bodyless('a'), 'A')
        loader.pin(bodyless('b'), 'B')

        expect(loader.peek(bodyless('a'))).toBeUndefined()
        expect(loader.peek(bodyless('b'))).toBe('B')
    })
})
