import { getDailyNoteTitle, planDailyNote } from '../daily-note'

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
