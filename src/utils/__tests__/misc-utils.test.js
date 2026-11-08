import { getNoteKey } from '../note-key'
import { buildNotePayload } from '../note-payload'
import { buildFileLinkUrl, isFileLinkTarget } from '../file-links'

describe('note key', () => {
    test('prefixes the id', () => {
        expect(getNoteKey('abc')).toBe('note:abc')
    })
})

describe('note payload', () => {
    test('trims title and body', () => {
        const payload = buildNotePayload({ path: 'p', title: ' T ', note: ' N ', tags: [] })

        expect(payload).toMatchObject({ title: 'T', note: 'N' })
    })

    test('defaults frontmatter fields to null', () => {
        const payload = buildNotePayload({ path: 'p', title: 'T', note: 'N', tags: [] })

        expect(payload).toMatchObject({ invalidFrontmatter: null, rawFrontmatter: null })
    })
})

describe('file links', () => {
    test('detects an attachment target', () => {
        expect(isFileLinkTarget('doc.pdf')).toBe(true)
    })

    test('ignores a note target', () => {
        expect(isFileLinkTarget('My note')).toBe(false)
    })

    test('ignores the anchor when detecting', () => {
        expect(isFileLinkTarget('doc.pdf#page')).toBe(true)
    })

    test('builds an encoded url without the anchor', () => {
        expect(buildFileLinkUrl('my doc.pdf#page')).toBe('filelink://my%20doc.pdf')
    })
})
