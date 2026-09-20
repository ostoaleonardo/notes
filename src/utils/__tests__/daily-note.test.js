import { getDailyNoteTitle } from '../daily-note'

test('formats the date as YYYY-MM-DD', () => {
    expect(getDailyNoteTitle(new Date(2026, 0, 5))).toBe('2026-01-05')
})

test('pads single-digit months and days', () => {
    expect(getDailyNoteTitle(new Date(2026, 8, 9))).toBe('2026-09-09')
})
