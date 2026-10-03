import { act, renderHook } from '@testing-library/react-native'

import { useVersionHistory } from '../use-version-history'

import { VERSION_SNAPSHOT_INTERVAL } from '@/constants/default-values'

const mockCommitVersion = jest.fn()
const LOCATION = {
    rootUri: 'uri',
    folderUri: 'uri',
    folderPath: ''
}

jest.mock('../use-note-versions', () => ({
    useNoteVersions: () => ({ commitVersion: mockCommitVersion })
}))

beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
})

afterEach(() => {
    jest.useRealTimers()
})

describe('visibility', () => {
    test('onOpen and onClose toggle the panel', async () => {
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'Content' } }

        const { result } = await renderHook(() => useVersionHistory({
            location: LOCATION, latestContent
        }))

        await act(() => {
            result.current.onOpen()
        })

        expect(result.current.visible).toBe(true)

        await act(() => {
            result.current.onClose()
        })

        expect(result.current.visible).toBe(false)
    })
})

describe('commit on unmount', () => {
    test('commits the latest content when a location is set', async () => {
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'Content' } }

        const { unmount } = await renderHook(() => useVersionHistory({
            location: LOCATION, latestContent
        }))

        await unmount()

        expect(mockCommitVersion).toHaveBeenCalledWith(LOCATION, 'note-1', 'Title', 'Content')
    })

    test('does not commit when there is no location', async () => {
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'Content' } }

        const { unmount } = await renderHook(() => useVersionHistory({
            location: null, latestContent
        }))

        await unmount()

        expect(mockCommitVersion).not.toHaveBeenCalled()
    })

    test('does not commit when there is no note id', async () => {
        const latestContent = { current: { noteId: '', title: 'Title', content: 'Content' } }

        const { unmount } = await renderHook(() => useVersionHistory({
            location: LOCATION, latestContent
        }))

        await unmount()

        expect(mockCommitVersion).not.toHaveBeenCalled()
    })

    test('reads the content current at unmount time, not at mount time', async () => {
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'First' } }

        const { unmount } = await renderHook(() => useVersionHistory({
            location: LOCATION, latestContent
        }))

        latestContent.current = { noteId: 'note-1', title: 'Title', content: 'Second' }

        await unmount()

        expect(mockCommitVersion).toHaveBeenCalledWith(LOCATION, 'note-1', 'Title', 'Second')
    })
})

describe('periodic snapshot', () => {
    test('commits again after the snapshot interval elapses', async () => {
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'Content' } }

        await renderHook(() => useVersionHistory({ location: LOCATION, latestContent }))

        await act(() => {
            jest.advanceTimersByTime(VERSION_SNAPSHOT_INTERVAL)
        })

        expect(mockCommitVersion).toHaveBeenCalledWith(LOCATION, 'note-1', 'Title', 'Content')
    })

    test('does not schedule a snapshot without a location', async () => {
        const latestContent = { current: { noteId: 'note-1', title: 'Title', content: 'Content' } }

        await renderHook(() => useVersionHistory({ location: null, latestContent }))

        await act(() => {
            jest.advanceTimersByTime(VERSION_SNAPSHOT_INTERVAL)
        })

        expect(mockCommitVersion).not.toHaveBeenCalled()
    })
})
