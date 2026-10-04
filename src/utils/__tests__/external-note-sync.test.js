import { planExternalSync } from '../external-note-sync'

const base = {
    note: 'body',
    tags: ['a'],
    properties: { x: 1 },
    invalidFrontmatter: null
}

describe('plan external sync', () => {
    test('returns the incoming note when the draft is clean and the disk changed', () => {
        const incoming = { ...base, note: 'changed on disk' }

        expect(planExternalSync({ draft: base, original: base, incoming })).toBe(incoming)
    })

    test('keeps local edits when the draft has unsaved changes', () => {
        const draft = { ...base, note: 'typing' }
        const incoming = { ...base, note: 'changed on disk' }

        expect(planExternalSync({ draft, original: base, incoming })).toBeNull()
    })

    test('ignores incoming data that only differs by surrounding whitespace', () => {
        const draft = { ...base, note: 'body\n' }
        const incoming = { ...base, note: 'body' }

        expect(planExternalSync({ draft, original: draft, incoming })).toBeNull()
    })

    test('detects external tag and property changes', () => {
        const withTags = { ...base, tags: ['a', 'b'] }
        const withProperties = { ...base, properties: { x: 2 } }

        expect(planExternalSync({ draft: base, original: base, incoming: withTags })).toBe(withTags)
        expect(planExternalSync({ draft: base, original: base, incoming: withProperties })).toBe(withProperties)
    })

    test('returns null when nothing changed or the note is gone', () => {
        expect(planExternalSync({ draft: base, original: base, incoming: { ...base } })).toBeNull()
        expect(planExternalSync({ draft: base, original: base, incoming: undefined })).toBeNull()
    })
})
