import { act, renderHook } from '@testing-library/react-native'

import { useNoteMove } from '../use-note-move'
import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { DUPLICATE_TITLE_ERROR } from '@/constants/note-errors'

const mockMoveNote = jest.fn()
const mockUpdatePinned = jest.fn()
const mockRemoveRecent = jest.fn()

jest.mock('../use-notes', () => ({
    useNotes: () => ({ moveNote: mockMoveNote })
}))
jest.mock('../use-utils', () => ({
    useUtils: () => ({ pinned: mockPinned, updatePinned: mockUpdatePinned })
}))
jest.mock('../use-recent-notes', () => ({
    useRecentNotes: () => ({ removeRecent: mockRemoveRecent })
}))
jest.mock('@/components/snackbar/snackbar-host', () => ({
    showSnackbar: jest.fn()
}))
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key })
}))
jest.mock('@/utils/log-error', () => ({
    logError: jest.fn()
}))

let mockPinned

const MOVED = { path: 'child::Idea.md', filename: 'Idea.md', repositoryId: 'child', updatedAt: 9 }

const setup = async (overrides = {}) => {
    const props = {
        id: 'root::Idea.md',
        busyRef: { current: false },
        flush: jest.fn(async () => {}),
        onMoved: jest.fn(),
        ...overrides
    }

    const { result } = await renderHook(() => useNoteMove(props))

    return { props, result }
}

describe('note move', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPinned = new Set()
        mockMoveNote.mockResolvedValue(MOVED)
    })

    test('flushes pending edits, moves the note and reports the new location', async () => {
        const { result, props } = await setup()

        await act(async () => result.current.onSelect('child'))

        expect(props.flush).toHaveBeenCalled()
        expect(mockMoveNote).toHaveBeenCalledWith('root::Idea.md', 'child')
        expect(props.onMoved).toHaveBeenCalledWith(MOVED)
        expect(mockRemoveRecent).toHaveBeenCalledWith('root::Idea.md')
    })

    test('keeps a pinned note pinned under its new path', async () => {
        mockPinned = new Set(['root::Idea.md', 'other'])
        const { result } = await setup()

        await act(async () => result.current.onSelect('child'))

        expect(mockUpdatePinned).toHaveBeenCalledWith(new Set(['other', 'child::Idea.md']))
    })

    test('does not touch pins when the note is not pinned', async () => {
        const { result } = await setup()

        await act(async () => result.current.onSelect('child'))

        expect(mockUpdatePinned).not.toHaveBeenCalled()
    })

    test('marks the editor busy only while moving', async () => {
        let busyDuringMove
        const busyRef = { current: false }
        mockMoveNote.mockImplementation(async () => {
            busyDuringMove = busyRef.current
            return MOVED
        })
        const { result } = await setup({ busyRef })

        await act(async () => result.current.onSelect('child'))

        expect(busyDuringMove).toBe(true)
        expect(busyRef.current).toBe(false)
    })

    test('does nothing more when the note was not moved', async () => {
        mockMoveNote.mockResolvedValue(null)
        const { result, props } = await setup()

        await act(async () => result.current.onSelect('root'))

        expect(props.onMoved).not.toHaveBeenCalled()
        expect(mockRemoveRecent).not.toHaveBeenCalled()
    })

    test('shows the duplicate message when the destination has the same name', async () => {
        const error = Object.assign(new Error('duplicate'), { code: DUPLICATE_TITLE_ERROR })
        mockMoveNote.mockRejectedValue(error)
        const { result, props } = await setup()

        await act(async () => result.current.onSelect('child'))

        expect(showSnackbar).toHaveBeenCalledWith('notes.move.duplicate')
        expect(props.onMoved).not.toHaveBeenCalled()
        expect(props.busyRef.current).toBe(false)
    })

    test('shows a generic message when the move fails', async () => {
        mockMoveNote.mockRejectedValue(new Error('boom'))
        const { result } = await setup()

        await act(async () => result.current.onSelect('child'))

        expect(showSnackbar).toHaveBeenCalledWith('notes.move.failed')
    })
})
