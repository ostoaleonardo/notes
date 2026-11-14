import {
    getDailyNoteTitle,
    planDailyNote,
    findAdjacentDailyNote,
    pickRandomNote
} from '../daily-note'

test('formats the date as YYYY-MM-DD', () => {
    expect(getDailyNoteTitle(new Date(2026, 0, 5))).toBe('2026-01-05')
})

test('pads single-digit months and days', () => {
    expect(getDailyNoteTitle(new Date(2026, 8, 9))).toBe('2026-09-09')
})

describe('plan daily note', () => {
    const root = { id: 'root', uri: 'uri-root' }
    const child = { id: 'child', uri: 'uri-child' }
    const title = '2026-01-05'
    const allExist = () => true

    const plan = (overrides, directoryExists = allExist) => planDailyNote({
        title,
        notes: [],
        folderId: '',
        activeRepository: root,
        descendants: [child],
        ...overrides
    }, directoryExists)

    test('targets the active repository when no folder is selected', () => {
        expect(plan().repository).toBe(root)
    })

    test('targets the selected subfolder', () => {
        expect(plan({ folderId: 'child' }).repository).toBe(child)
    })

    test('falls back to the active repository when the selected folder is unknown', () => {
        expect(plan({ folderId: 'gone' }).repository).toBe(root)
    })

    test('falls back to the active repository when the selected folder is missing on disk', () => {
        const directoryExists = (uri) => uri !== child.uri

        expect(plan({ folderId: 'child' }, directoryExists).repository).toBe(root)
    })

    test('returns null when no target folder exists on disk', () => {
        expect(plan({ folderId: 'child' }, () => false)).toBeNull()
    })

    test('finds the existing note in the target folder', () => {
        const note = { repositoryId: 'child', title, path: 'child/2026-01-05.md' }

        expect(plan({ folderId: 'child', notes: [note] }).existing).toBe(note)
    })

    test('ignores a note with the same title in another folder', () => {
        const note = { repositoryId: 'root', title, path: 'root/2026-01-05.md' }

        expect(plan({ folderId: 'child', notes: [note] }).existing).toBeUndefined()
    })
})

describe('adjacent daily notes', () => {
    const daily = (title, repositoryId = 'root') => ({ title, repositoryId, path: title })
    const notes = [
        daily('2026-01-01'),
        daily('2026-01-05'),
        daily('2026-01-09'),
        daily('2026-01-07', 'other'),
        { title: 'Meeting', repositoryId: 'root', path: 'Meeting' }
    ]

    test('finds the closest earlier daily note skipping gaps', () => {
        expect(findAdjacentDailyNote(notes, notes[1], 'previous')).toBe(notes[0])
    })

    test('finds the closest later daily note skipping gaps', () => {
        expect(findAdjacentDailyNote(notes, notes[1], 'next')).toBe(notes[2])
    })

    test('ignores daily notes of other folders', () => {
        expect(findAdjacentDailyNote(notes, notes[2], 'next')).toBeNull()
    })

    test('returns null when the current note is not a daily note', () => {
        expect(findAdjacentDailyNote(notes, notes[4], 'next')).toBeNull()
        expect(findAdjacentDailyNote(notes, null, 'next')).toBeNull()
    })
})

describe('random note', () => {
    const notes = [{ path: 'a' }, { path: 'b' }, { path: 'c' }]

    test('picks by the random value and never the excluded note', () => {
        expect(pickRandomNote(notes, 'a', () => 0)).toBe(notes[1])
        expect(pickRandomNote(notes, 'a', () => 0.99)).toBe(notes[2])
    })

    test('returns null when there is nothing else to open', () => {
        expect(pickRandomNote([{ path: 'a' }], 'a')).toBeNull()
        expect(pickRandomNote([], '')).toBeNull()
    })
})
