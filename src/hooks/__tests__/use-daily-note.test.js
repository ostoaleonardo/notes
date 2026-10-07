import { renderHook } from '@testing-library/react-native'

import { useDailyNote } from '../use-daily-note'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const mockSaveNote = jest.fn()
const mockGetTemplate = jest.fn()
const mockGetItem = jest.fn()
const mockSetItem = jest.fn()
const mockDirectoryExists = jest.fn()
const mockGetDescendants = jest.fn()

const mockActiveRepository = { id: 'repo', uri: 'content://repo' }
let mockNotes = []

jest.mock('../use-notes', () => ({
    useNotes: () => ({ notes: mockNotes, saveNote: mockSaveNote })
}))

jest.mock('../use-repositories', () => ({
    useRepositories: () => ({
        activeRepository: mockActiveRepository,
        getDescendants: mockGetDescendants
    })
}))

jest.mock('../use-templates', () => ({
    useTemplates: () => ({ getTemplate: mockGetTemplate })
}))

jest.mock('../use-language', () => ({
    useLanguage: () => ({ currentLanguage: 'en' })
}))

jest.mock('../use-storage', () => ({
    useStorage: () => ({ getItem: mockGetItem, setItem: mockSetItem })
}))

jest.mock('../use-file-storage', () => ({
    useFileStorage: () => ({ directoryExists: mockDirectoryExists })
}))

jest.mock('@/utils/daily-note', () => ({
    ...jest.requireActual('@/utils/daily-note'),
    getDailyNoteTitle: () => '2024-01-05'
}))

jest.mock('@/utils/date', () => ({ getDate: () => 123 }))

const templateKey = `${STORAGE_KEYS.DAILY_NOTE_TEMPLATE}:repo`

describe('daily note', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockNotes = []
        mockGetItem.mockResolvedValue(null)
        mockGetDescendants.mockReturnValue([])
        mockDirectoryExists.mockReturnValue(true)
        mockSaveNote.mockResolvedValue({ path: 'repo::2024-01-05.md' })
    })

    test('creates the note of the day when it does not exist', async () => {
        const { result } = await renderHook(() => useDailyNote())

        const path = await result.current()

        expect(path).toBe('repo::2024-01-05.md')
        expect(mockSaveNote).toHaveBeenCalledWith(
            { title: '2024-01-05', note: '', tags: [], createdAt: 123 },
            'repo'
        )
    })

    test('returns the existing note without creating another', async () => {
        mockNotes = [{ repositoryId: 'repo', title: '2024-01-05', path: 'existing' }]
        const { result } = await renderHook(() => useDailyNote())

        const path = await result.current()

        expect(path).toBe('existing')
        expect(mockSaveNote).not.toHaveBeenCalled()
    })

    test('returns null when the repository folder is gone', async () => {
        mockDirectoryExists.mockReturnValue(false)
        const { result } = await renderHook(() => useDailyNote())

        expect(await result.current()).toBeNull()
        expect(mockSaveNote).not.toHaveBeenCalled()
    })

    test('seeds the note from the configured template', async () => {
        mockGetItem.mockImplementation(async (key) => (
            key === templateKey ? 'daily.md' : null
        ))
        mockGetTemplate.mockResolvedValue({ content: 'Day {{title}}' })
        const { result } = await renderHook(() => useDailyNote())

        await result.current()

        expect(mockSaveNote.mock.calls[0][0].note).toContain('Day')
    })

    test('clears a template setting that points to a missing template', async () => {
        mockGetItem.mockImplementation(async (key) => (
            key === templateKey ? 'gone.md' : null
        ))
        mockGetTemplate.mockResolvedValue(null)
        const { result } = await renderHook(() => useDailyNote())

        await result.current()

        expect(mockSetItem).toHaveBeenCalledWith(templateKey, '')
        expect(mockSaveNote.mock.calls[0][0].note).toBe('')
    })

    test('ignores a second call while the first is running', async () => {
        const { result } = await renderHook(() => useDailyNote())

        const [first, second] = await Promise.all([result.current(), result.current()])

        expect(first).toBe('repo::2024-01-05.md')
        expect(second).toBeNull()
        expect(mockSaveNote).toHaveBeenCalledTimes(1)
    })
})
