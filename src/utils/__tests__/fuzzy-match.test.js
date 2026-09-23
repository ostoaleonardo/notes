import { fuzzyMatch } from '../fuzzy-match'

describe('fuzzy match', () => {
    test('matches an empty query against anything', () => {
        expect(fuzzyMatch('', 'Weekly standup')).toEqual({ matches: true, score: 0 })
    })

    test('matches an exact substring', () => {
        expect(fuzzyMatch('standup', 'Weekly standup').matches).toBe(true)
    })

    test('matches a non-contiguous subsequence', () => {
        expect(fuzzyMatch('wkstandup', 'Weekly standup').matches).toBe(true)
    })

    test('does not match when a character is missing', () => {
        expect(fuzzyMatch('standupx', 'Weekly standup').matches).toBe(false)
    })

    test('does not match out-of-order characters', () => {
        expect(fuzzyMatch('putsdnats', 'Weekly standup').matches).toBe(false)
    })

    test('scores a contiguous match higher than a scattered match of the same query', () => {
        const contiguous = fuzzyMatch('note', 'xxnotexx')
        const scattered = fuzzyMatch('note', 'n123o456t789e')

        expect(contiguous.score).toBeGreaterThan(scattered.score)
    })
})
