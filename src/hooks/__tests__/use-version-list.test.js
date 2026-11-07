import { waitFor, renderHook } from '@testing-library/react-native'

import { useVersionList } from '../use-version-list'

import { FREE_VERSION_HISTORY_LIMIT } from '@/constants/default-values'

const mockGetVersions = jest.fn()
let mockPro = true

jest.mock('../use-pro', () => ({
    usePro: () => ({ pro: mockPro })
}))

jest.mock('../use-note-versions', () => ({
    useNoteVersions: () => ({ getVersions: mockGetVersions })
}))

const LOCATION = {
    rootUri: 'uri',
    folderUri: 'uri',
    folderPath: ''
}

describe('version list', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPro = true
        mockGetVersions.mockResolvedValue([{ id: 'a' }, { id: 'b' }])
    })

    test('returns the versions newest first once they load', async () => {
        const { result } = await renderHook(() => useVersionList({
            location: LOCATION, noteId: 'note-1'
        }))

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.versions).toEqual([{ id: 'b' }, { id: 'a' }])
    })

    test('limits the history for free users', async () => {
        mockPro = false

        await renderHook(() => useVersionList({ location: LOCATION, noteId: 'note-1' }))

        await waitFor(() => expect(mockGetVersions).toHaveBeenCalledWith(
            LOCATION,
            'note-1',
            FREE_VERSION_HISTORY_LIMIT
        ))
    })

    test('does not limit the history for pro users', async () => {
        await renderHook(() => useVersionList({
            location: LOCATION, noteId: 'note-1'
        }))

        await waitFor(() => expect(mockGetVersions).toHaveBeenCalledWith(LOCATION, 'note-1', Infinity))
    })

    test('stays empty without a location', async () => {
        const { result } = await renderHook(() => useVersionList({
            location: null, noteId: 'note-1'
        }))

        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.versions).toEqual([])
        expect(mockGetVersions).not.toHaveBeenCalled()
    })
})
