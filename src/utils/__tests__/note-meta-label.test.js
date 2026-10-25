import { buildNoteMetaLines } from '../note-meta-label'

const timestamp = new Date(2026, 9, 24, 20, 31).getTime()

const counts = {
    words: 6,
    characters: 31,
    wordsLabel: '6 words',
    charactersLabel: '31 characters'
}

const reading = { ...counts, showDate: true, timestamp, dateLabel: 'Updated', language: 'en' }
const editing = { ...counts, showDate: false, timestamp, dateLabel: 'Updated', language: 'en' }

describe('note meta lines while reading', () => {
    test('is empty without a timestamp', () => {
        expect(buildNoteMetaLines({ ...reading, timestamp: '' })).toEqual([])
    })

    test('shows only the date', () => {
        const lines = buildNoteMetaLines(reading)

        expect(lines).toHaveLength(1)
        expect(lines[0][0]).toEqual({ type: 'text', value: 'Updated' })
    })

    test('keeps the date as text and puts only the time in a chip', () => {
        const [line] = buildNoteMetaLines(reading)

        expect(line.map((item) => item.type)).toEqual(['text', 'text', 'filled'])
    })

    test('formats the date and the time separately', () => {
        const [line] = buildNoteMetaLines(reading)

        expect(line[1].value).toBe('Oct 24, 2026')
        expect(line[2].value).toMatch(/8:31/)
    })
})

describe('note meta lines while editing', () => {
    test('is empty when the note has no words', () => {
        expect(buildNoteMetaLines({ ...editing, words: 0 })).toEqual([])
    })

    test('shows only the counts', () => {
        expect(buildNoteMetaLines(editing)).toEqual([[
            { type: 'filled', value: '6' },
            { type: 'text', value: 'words' },
            { type: 'filled', value: '31' },
            { type: 'text', value: 'characters' }
        ]])
    })
})
