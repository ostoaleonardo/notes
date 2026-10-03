import { dedupeTags, hasTag, isSameTag, reconcileTags } from '../tag-names'

describe('tag names', () => {
    test('compares tags ignoring case', () => {
        expect(isSameTag('Work', 'work')).toBe(true)
        expect(isSameTag('work', 'home')).toBe(false)
    })

    test('finds a tag regardless of its casing', () => {
        expect(hasTag(['Work', 'Home'], 'HOME')).toBe(true)
        expect(hasTag(['Work'], 'home')).toBe(false)
    })

    test('keeps the first casing when removing duplicates', () => {
        expect(dedupeTags(['Work', 'work', 'Home', 'HOME'])).toEqual(['Work', 'Home'])
    })
})

describe('reconcile tags', () => {
    test('adds tags used by notes that are missing from the dictionary', () => {
        const notes = [{ tags: ['work', 'ideas'] }, { tags: ['ideas'] }]

        expect(reconcileTags(['work'], notes)).toEqual({
            tags: ['work', 'ideas'],
            changed: true
        })
    })

    test('keeps the dictionary casing over the note casing', () => {
        const result = reconcileTags(['Work'], [{ tags: ['work'] }])

        expect(result).toEqual({ tags: ['Work'], changed: false })
    })

    test('keeps dictionary tags that no note uses', () => {
        expect(reconcileTags(['unused'], [{ tags: [] }]).tags).toEqual(['unused'])
    })

    test('collapses case duplicates inside the dictionary', () => {
        expect(reconcileTags(['Work', 'work'], [])).toEqual({
            tags: ['Work'],
            changed: true
        })
    })

    test('tolerates notes without tags', () => {
        expect(reconcileTags(['a'], [{}]).changed).toBe(false)
    })
})
