import {
    fromSavedSnapshot,
    getNewNoteTitle,
    isDraftSaved,
    resolveNewNoteRepositoryId,
    toDraft,
    toSavedSnapshot
} from '../note-draft'

const content = {
    note: 'body',
    tags: ['a', 'b'],
    properties: { status: 'done' },
    invalidFrontmatter: null,
    rawFrontmatter: 'status: done'
}

describe('stored note to draft', () => {
    test('maps the stored fields to the draft', () => {
        const draft = toDraft({
            title: 'Title',
            note: 'body',
            tags: ['a'],
            properties: { x: 1 },
            repositoryId: 'r1',
            filename: 'a.md',
            invalidFrontmatter: 'bad',
            rawFrontmatter: 'raw'
        }, 'Untitled')

        expect(draft).toEqual({
            title: 'Title',
            note: 'body',
            tags: ['a'],
            properties: { x: 1 },
            repositoryId: 'r1',
            filename: 'a.md',
            invalidFrontmatter: 'bad',
            rawFrontmatter: 'raw'
        })
    })

    test('falls back to the untitled label and to empty values', () => {
        expect(toDraft({}, 'Untitled')).toEqual({
            title: 'Untitled',
            note: '',
            tags: [],
            properties: {},
            repositoryId: '',
            filename: '',
            invalidFrontmatter: null,
            rawFrontmatter: null
        })
    })
})

describe('saved snapshot', () => {
    test('freezes the properties as text', () => {
        expect(toSavedSnapshot(content).properties).toBe('{"status":"done"}')
    })

    test('restores the properties as an object', () => {
        expect(fromSavedSnapshot(toSavedSnapshot(content))).toEqual(content)
    })
})

describe('draft saved check', () => {
    const saved = toSavedSnapshot(content)

    test('is saved when nothing changed', () => {
        expect(isDraftSaved({ ...content, tags: ['a', 'b'], properties: { status: 'done' } }, saved)).toBe(true)
    })

    test.each([
        ['note', { note: 'other' }],
        ['tags', { tags: ['a'] }],
        ['properties', { properties: { status: 'open' } }],
        ['invalid frontmatter', { invalidFrontmatter: 'bad' }],
        ['raw frontmatter', { rawFrontmatter: 'status: open' }]
    ])('is not saved when the %s changed', (_, change) => {
        expect(isDraftSaved({ ...content, ...change }, saved)).toBe(false)
    })
})

describe('resolve new note repository', () => {
    test('prefers the requested folder, then the default folder, then the active one', () => {
        const ids = { targetRepositoryId: 't', defaultFolderId: 'd', activeRepositoryId: 'a' }

        expect(resolveNewNoteRepositoryId(ids)).toBe('t')
        expect(resolveNewNoteRepositoryId({ ...ids, targetRepositoryId: undefined })).toBe('d')
        expect(resolveNewNoteRepositoryId({ activeRepositoryId: 'a' })).toBe('a')
    })
})

describe('new note title', () => {
    const notes = [
        { repositoryId: 'r1', title: 'Untitled' },
        { repositoryId: 'r2', title: 'Untitled (2)' }
    ]

    test('numbers the title when it is taken in the same folder', () => {
        expect(getNewNoteTitle(notes, 'r1', 'Untitled')).toBe('Untitled (2)')
    })

    test('ignores titles from other folders', () => {
        expect(getNewNoteTitle(notes, 'r3', 'Untitled')).toBe('Untitled')
    })
})
