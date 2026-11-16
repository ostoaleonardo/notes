import { getFormattedDate } from '../formatted-date'
import { getDate } from '../date'

describe('formatted date', () => {
    test('includes the year, day and time of the timestamp', () => {
        const timestamp = new Date(2024, 2, 5, 14, 30).getTime()

        const result = getFormattedDate(timestamp, 'en-US')

        expect(result).toContain('2024')
        expect(result).toContain('5')
        expect(result).toContain('30')
    })

    test('changes the month name with the language', () => {
        const timestamp = new Date(2024, 2, 5, 14, 30).getTime()

        expect(getFormattedDate(timestamp, 'en-US')).toContain('Mar')
        expect(getFormattedDate(timestamp, 'es')).toContain('mar')
    })
})

describe('current date', () => {
    test('returns the current timestamp in milliseconds', () => {
        const before = Date.now()
        const result = getDate()

        expect(result).toBeGreaterThanOrEqual(before)
        expect(result).toBeLessThanOrEqual(Date.now())
    })
})
