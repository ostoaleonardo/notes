import { planExternalSync } from '../external-note-sync'

const base = {
    note: 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda',
    tags: ['a'],
    properties: { x: 1 },
    rawFrontmatter: null,
    invalidFrontmatter: null
}

describe('plan external sync', () => {
    test('adopts the incoming note when the draft is clean and the disk changed', () => {
        const incoming = { ...base, note: 'changed on disk' }

        expect(planExternalSync({ draft: base, original: base, incoming })).toEqual({
            draft: incoming,
            original: incoming,
            lostExternalText: false
        })
    })

    test('merges disk changes into a draft with unsaved edits', () => {
        const draft = { ...base, note: `${base.note} typed` }
        const incoming = { ...base, note: base.note.replace('gamma', 'GAMMA') }

        const plan = planExternalSync({ draft, original: base, incoming })

        expect(plan.draft.note).toBe(`${incoming.note} typed`)
        expect(plan.original).toBe(incoming)
        expect(plan.lostExternalText).toBe(false)
    })

    test('keeps the draft and flags the loss when the disk text cannot be merged', () => {
        const draft = {
            ...base,
            note: 'the quick brown fox jumps over the lazy dog and runs far away'
        }
        const incoming = { ...base, note: base.note.replace('gamma', 'GAMMA') }

        const plan = planExternalSync({ draft, original: base, incoming })

        expect(plan.draft.note).toBe(draft.note)
        expect(plan.original).toBe(incoming)
        expect(plan.lostExternalText).toBe(true)
    })

    test('ignores incoming data that only differs by surrounding whitespace', () => {
        const draft = { ...base, note: `${base.note}\n` }
        const incoming = { ...base }

        expect(planExternalSync({ draft, original: draft, incoming })).toBeNull()
    })

    test('detects external tag and property changes', () => {
        const withTags = { ...base, tags: ['a', 'b'] }
        const withProperties = { ...base, properties: { x: 2 } }

        expect(planExternalSync({ draft: base, original: base, incoming: withTags }).draft).toBe(
            withTags
        )
        expect(
            planExternalSync({ draft: base, original: base, incoming: withProperties }).draft
        ).toBe(withProperties)
    })

    test('returns null when nothing changed or the note is gone', () => {
        expect(planExternalSync({ draft: base, original: base, incoming: { ...base } })).toBeNull()
        expect(planExternalSync({ draft: base, original: base, incoming: undefined })).toBeNull()
    })
})
