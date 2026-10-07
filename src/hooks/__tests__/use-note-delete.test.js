import { act, renderHook } from '@testing-library/react-native'
import { router } from 'expo-router'

import { useNoteDelete } from '../use-note-delete'
import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { DELETE_BEHAVIORS, DEFAULT_DELETE_BEHAVIOR } from '@/constants/delete-behavior'

const mockDeleteNote = jest.fn()
const mockGetItem = jest.fn()

jest.mock('expo-router', () => ({
    router: { back: jest.fn() }
}))
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key })
}))
jest.mock('@/components/snackbar/snackbar-host', () => ({
    showSnackbar: jest.fn()
}))
jest.mock('@/utils/log-error', () => ({
    logError: jest.fn()
}))
jest.mock('../use-notes', () => ({
    useNotes: () => ({ deleteNote: mockDeleteNote })
}))
jest.mock('../use-storage', () => ({
    useStorage: () => ({ getItem: mockGetItem })
}))

const setup = () => renderHook(() => useNoteDelete('repo::note.md'))

beforeEach(() => {
    jest.clearAllMocks()
    mockDeleteNote.mockResolvedValue(undefined)
    mockGetItem.mockResolvedValue(null)
})

describe('open delete dialog', () => {
    test('shows the dialog with the default behavior', async () => {
        const { result } = await setup()

        await act(async () => result.current.onOpen())

        expect(result.current.visible).toBe(true)
        expect(result.current.behavior).toBe(DEFAULT_DELETE_BEHAVIOR)
    })

    test('shows the dialog with the stored behavior', async () => {
        mockGetItem.mockResolvedValue(DELETE_BEHAVIORS.PERMANENT)
        const { result } = await setup()

        await act(async () => result.current.onOpen())

        expect(result.current.behavior).toBe(DELETE_BEHAVIORS.PERMANENT)
    })
})

describe('confirm delete', () => {
    test('deletes the note and goes back', async () => {
        const { result } = await setup()

        await act(async () => result.current.onConfirm())

        expect(mockDeleteNote).toHaveBeenCalledWith('repo::note.md')
        expect(router.back).toHaveBeenCalledTimes(1)
    })

    test('keeps the editor busy during deletion so it does not redirect again', async () => {
        const busyRef = { current: false }
        let busyDuringDelete
        mockDeleteNote.mockImplementation(async () => {
            busyDuringDelete = busyRef.current
        })

        const { result } = await renderHook(() => useNoteDelete('repo::note.md', busyRef))
        await act(async () => result.current.onConfirm())

        expect(busyDuringDelete).toBe(true)
    })

    test('releases the busy flag when deleting fails', async () => {
        const busyRef = { current: false }
        mockDeleteNote.mockRejectedValue(new Error('boom'))

        const { result } = await renderHook(() => useNoteDelete('repo::note.md', busyRef))
        await act(async () => result.current.onConfirm())

        expect(busyRef.current).toBe(false)
    })

    test('stays on the note and warns when deleting fails', async () => {
        mockDeleteNote.mockRejectedValue(new Error('boom'))
        const { result } = await setup()

        await act(async () => result.current.onConfirm())

        expect(router.back).not.toHaveBeenCalled()
        expect(showSnackbar).toHaveBeenCalledWith('notes.delete_failed')
    })
})
