import { buildNoteMetaLabel } from '../note-meta-label'
import { getFormattedDate } from '../formatted-date'

describe('buildNoteMetaLabel', () => {
    test('returns empty string when showing the date but there is no timestamp', () => {
        expect(buildNoteMetaLabel({ showDate: true, timestamp: '', currentLanguage: 'en', words: 0 })).toBe('')
    })

    test('formats the label with the given timestamp and language', () => {
        const timestamp = 1700000000000
        const label = buildNoteMetaLabel({
            showDate: true,
            timestamp,
            dateLabel: 'Created',
            currentLanguage: 'en',
            words: 0
        })

        expect(label).toBe(`Created ${getFormattedDate(timestamp, 'en')}`)
    })

    test('returns empty string when not showing the date and there are no words', () => {
        expect(buildNoteMetaLabel({ showDate: false, words: 0 })).toBe('')
    })

    test('shows word and character counts when not showing the date', () => {
        const label = buildNoteMetaLabel({
            showDate: false,
            words: 2,
            wordsLabel: '2 words',
            charactersLabel: '11 characters'
        })

        expect(label).toBe('2 words · 11 characters')
    })
})
