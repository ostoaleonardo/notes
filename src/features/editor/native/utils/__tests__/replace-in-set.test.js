import { replaceInSet } from '../replace-in-set'

describe('replace in set', () => {
    test('swaps one value for another without mutating the original', () => {
        const original = new Set(['a', 'b'])

        const next = replaceInSet(original, 'a', 'c')

        expect(next).toEqual(new Set(['b', 'c']))
        expect(original).toEqual(new Set(['a', 'b']))
    })
})
