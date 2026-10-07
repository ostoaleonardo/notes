import { buildLegacyNoteBody } from '../legacy-note-body'

describe('legacy note body', () => {
    test('returns only the text when there is no list or image', () => {
        expect(buildLegacyNoteBody({ note: 'hello' })).toBe('hello')
    })

    test('renders a bulleted list', () => {
        const note = {
            note: '',
            list: { type: 'bulleted', items: [{ value: 'a' }, { value: 'b' }] }
        }

        expect(buildLegacyNoteBody(note)).toBe('- a\n- b')
    })

    test('renders a numbered list', () => {
        const note = {
            note: '',
            list: { type: 'numbered', items: [{ value: 'a' }, { value: 'b' }] }
        }

        expect(buildLegacyNoteBody(note)).toBe('1. a\n2. b')
    })

    test('renders checklist status', () => {
        const note = {
            note: '',
            list: {
                type: 'checklist',
                items: [{ value: 'a', status: 'checked' }, { value: 'b' }]
            }
        }

        expect(buildLegacyNoteBody(note)).toBe('- [x] a\n- [ ] b')
    })

    test('skips blank list items', () => {
        const note = {
            note: '',
            list: { type: 'bulleted', items: [{ value: ' ' }, { value: 'a' }] }
        }

        expect(buildLegacyNoteBody(note)).toBe('- a')
    })

    test('joins text, list and images with blank lines', () => {
        const note = {
            note: 'text',
            list: { type: 'bulleted', items: [{ value: 'a' }] }
        }

        expect(buildLegacyNoteBody(note, ['u1'])).toBe('text\n\n- a\n\n![](u1)')
    })
})
