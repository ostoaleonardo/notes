import { act, renderHook } from '@testing-library/react-native'

import { useVersionHistory } from '../use-version-history'

import { VERSION_UNMOUNT_COMMIT_DELAY } from '@/shared/constants/default-values'
import { MS_PER_MINUTE } from '@/shared/constants/history-settings'
import { STORAGE_KEYS } from '@/shared/constants/storage-keys'

const DEFAULT_INTERVAL = 5 * MS_PER_MINUTE

const mockCommitVersion = jest.fn()
const mockGetItem = jest.fn()
const mockOpenVersionHistory = jest.fn()
const LOCATION = {
    rootUri: 'uri',
    folderUri: 'uri',
    folderPath: ''
}

jest.mock('@/shared/utils/version-history-session', () => ({
    openVersionHistory: (...args) => mockOpenVersionHistory(...args)
}))

jest.mock('../use-storage', () => ({
    useStorage: () => ({ getItem: mockGetItem })
}))

jest.mock('../use-note-versions', () => ({
    useNoteVersions: () => ({ commitVersion: mockCommitVersion })
}))

beforeEach(() => {
    jest.clearAllMocks()
    mockGetItem.mockResolvedValue(null)
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

describe('open history', () => {
    test('opens the history screen with the note session', async () => {
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'Content' } }
        const onRestore = jest.fn()

        const { result } = await renderHook(() => useVersionHistory({
            location: LOCATION, latestContent, onRestore
        }))

        await act(() => {
            result.current.onOpen()
        })

        const session = mockOpenVersionHistory.mock.calls[0][0]
        session.onRestore({ title: 'Old' })

        expect(session.noteId).toBe('note-1')
        expect(session.location).toBe(LOCATION)
        expect(session.contentRef).toBe(latestContent)
        expect(onRestore).toHaveBeenCalledWith({ title: 'Old' })
    })
})

describe('commit on unmount', () => {
    test('commits the latest content when a location is set', async () => {
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'Content' } }

        const { unmount } = await renderHook(() => useVersionHistory({
            location: LOCATION, latestContent
        }))

        await unmount()

        expect(mockCommitVersion).not.toHaveBeenCalled()

        await act(() => {
            jest.advanceTimersByTime(VERSION_UNMOUNT_COMMIT_DELAY)
        })

        expect(mockCommitVersion).toHaveBeenCalledWith(LOCATION, 'note-1', 'Title', 'Content')
    })

    test('does not commit when there is no location', async () => {
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'Content' } }

        const { unmount } = await renderHook(() => useVersionHistory({
            location: null, latestContent
        }))

        await unmount()
        jest.advanceTimersByTime(VERSION_UNMOUNT_COMMIT_DELAY)

        expect(mockCommitVersion).not.toHaveBeenCalled()
    })

    test('does not commit when there is no note id', async () => {
        const latestContent = { current: { noteId: '', title: 'Title', content: 'Content' } }

        const { unmount } = await renderHook(() => useVersionHistory({
            location: LOCATION, latestContent
        }))

        await unmount()
        jest.advanceTimersByTime(VERSION_UNMOUNT_COMMIT_DELAY)

        expect(mockCommitVersion).not.toHaveBeenCalled()
    })

    test('reads the content current at unmount time, not at mount time', async () => {
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'First' } }

        const { unmount } = await renderHook(() => useVersionHistory({
            location: LOCATION, latestContent
        }))

        latestContent.current = { noteId: 'note-1', title: 'Title', content: 'Second' }

        await unmount()
        jest.advanceTimersByTime(VERSION_UNMOUNT_COMMIT_DELAY)

        expect(mockCommitVersion).toHaveBeenCalledWith(LOCATION, 'note-1', 'Title', 'Second')
    })
})

describe('periodic snapshot', () => {
    test('commits again after the snapshot interval elapses', async () => {
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'Content' } }

        await renderHook(() => useVersionHistory({ location: LOCATION, latestContent }))

        await act(async () => {
            jest.advanceTimersByTime(DEFAULT_INTERVAL)
        })

        expect(mockCommitVersion).toHaveBeenCalledWith(LOCATION, 'note-1', 'Title', 'Content')
    })

    test('uses the interval chosen in the settings', async () => {
        mockGetItem.mockImplementation(async (key) => (
            key === STORAGE_KEYS.HISTORY_INTERVAL ? '1' : null
        ))
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'Content' } }

        await renderHook(() => useVersionHistory({ location: LOCATION, latestContent }))

        await act(async () => {
            jest.advanceTimersByTime(MS_PER_MINUTE - 1)
        })

        expect(mockCommitVersion).not.toHaveBeenCalled()

        await act(async () => {
            jest.advanceTimersByTime(1)
        })

        expect(mockCommitVersion).toHaveBeenCalledTimes(1)
    })

    test('does not schedule a snapshot without a location', async () => {
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'Content' } }

        await renderHook(() => useVersionHistory({ location: null, latestContent }))

        await act(async () => {
            jest.advanceTimersByTime(DEFAULT_INTERVAL)
        })

        expect(mockCommitVersion).not.toHaveBeenCalled()
    })
})
