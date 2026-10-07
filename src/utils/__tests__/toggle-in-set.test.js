import { toggleInSet } from '../toggle-in-set'

describe('toggle in set', () => {
    test('adds a value that is missing', () => {
        expect([...toggleInSet(new Set(['a']), 'b')]).toEqual(['a', 'b'])
    })

    test('removes a value that is present', () => {
        expect([...toggleInSet(new Set(['a', 'b']), 'a')]).toEqual(['b'])
    })

    test('does not mutate the original set', () => {
        const original = new Set(['a'])

        toggleInSet(original, 'b')

        expect([...original]).toEqual(['a'])
    })
})
