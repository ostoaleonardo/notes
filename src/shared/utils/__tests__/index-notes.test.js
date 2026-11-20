import { buildNoteFromMetadata, createIndexedNotesCounter, createIndexedNotesLoader } from '../index-notes'
import { getNoteLinkTexts } from '../note-links'
import { getNoteTags } from '../note-tags'
import { buildNotePath } from '../note-path'

const metadata = (overrides = {}) => ({
    folderId: 'repo',
    filename: 'Daily.md',
    fileUri: 'file:///Daily.md',
    title: 'Daily',
    createdAt: 5,
    updatedAt: 5,
    size: 10,
    tags: ['work'],
    inlineTags: ['idea', 'Work'],
    properties: { status: 'open', aliases: ['D'] },
    linkTexts: ['Other', 'Third#Part'],
    invalidFrontmatter: null,
    rawFrontmatter: 'status: open',
    ...overrides
})

describe('build a note from index metadata', () => {
    test('copies the file and frontmatter fields', () => {
        const note = buildNoteFromMetadata(metadata())

        expect(note).toEqual({
            filename: 'Daily.md',
            folderId: 'repo',
            path: buildNotePath('repo', 'Daily.md'),
            fileUri: 'file:///Daily.md',
            title: 'Daily',
            tags: ['work'],
            properties: { status: 'open', aliases: ['D'] },
            invalidFrontmatter: null,
            rawFrontmatter: 'status: open',
            createdAt: 5,
            updatedAt: 5
        })
    })

    test('has no body until it is loaded on demand', () => {
        expect(buildNoteFromMetadata(metadata())).not.toHaveProperty('note')
    })

    test('seeds the combined tags without reading the body', () => {
        expect(getNoteTags(buildNoteFromMetadata(metadata()))).toEqual(['work', 'idea'])
    })

    test('seeds the link texts without reading the body', () => {
        expect(getNoteLinkTexts(buildNoteFromMetadata(metadata()))).toEqual(['Other', 'Third#Part'])
    })

    test('keeps the raw text of an invalid frontmatter', () => {
        const note = buildNoteFromMetadata(metadata({
            invalidFrontmatter: 'tags: [a',
            rawFrontmatter: null
        }))

        expect(note.invalidFrontmatter).toBe('tags: [a')
        expect(note.rawFrontmatter).toBeNull()
    })
})

describe('load notes from the index', () => {
    test('asks for the folders and builds every note in order', async () => {
        const listNoteMetadata = jest.fn(async () => JSON.stringify([
            metadata({ filename: 'B.md', title: 'B' }),
            metadata({ filename: 'A.md', title: 'A' })
        ]))

        const notes = await createIndexedNotesLoader({ listNoteMetadata })(['repo', 'child'])

        expect(listNoteMetadata).toHaveBeenCalledWith(['repo', 'child'])
        expect(notes.map((note) => note.title)).toEqual(['B', 'A'])
    })

    test('returns no notes for an empty index', async () => {
        const load = createIndexedNotesLoader({ listNoteMetadata: async () => '[]' })

        expect(await load(['repo'])).toEqual([])
    })
})

describe('count the indexed notes', () => {
    test('asks the index for the notes of the given repositories', async () => {
        const query = jest.fn(async () => [{ count: 42 }])

        const count = await createIndexedNotesCounter(query)(['a', 'b'])

        expect(count).toBe(42)
        expect(query).toHaveBeenCalledWith(
            'SELECT COUNT(*) AS count FROM notes WHERE repository_id IN (?,?)',
            'a',
            'b'
        )
    })

    test('counts nothing without asking when there are no repositories', async () => {
        const query = jest.fn()

        expect(await createIndexedNotesCounter(query)([])).toBe(0)
        expect(query).not.toHaveBeenCalled()
    })

    test('counts zero when the index returns no row', async () => {
        expect(await createIndexedNotesCounter(async () => [])(['a'])).toBe(0)
    })
})
