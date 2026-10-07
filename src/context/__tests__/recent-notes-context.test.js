import { useContext } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import { RecentNotesContext, RecentNotesProvider } from '../recent-notes-context'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
}

jest.mock('@/hooks/use-storage', () => ({
    useStorage: () => mockStorage
}))

const setup = async (stored) => {
    mockStorage.getItem.mockResolvedValue(stored)
    const hook = await renderHook(() => useContext(RecentNotesContext), {
        wrapper: RecentNotesProvider
    })
    await waitFor(() => expect(mockStorage.getItem).toHaveBeenCalled())
    return hook
}

describe('recent notes context', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockStorage.setItem.mockResolvedValue()
    })

    test('starts empty when nothing is stored', async () => {
        const { result } = await setup(null)

        expect(result.current.recent).toEqual([])
    })

    test('loads the stored recent notes', async () => {
        const { result } = await setup(JSON.stringify(['a', 'b']))

        await waitFor(() => expect(result.current.recent).toEqual(['a', 'b']))
        expect(mockStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.RECENT_NOTES)
    })

    test('removes a note and persists the remaining ones', async () => {
        const { result } = await setup(JSON.stringify(['a', 'b']))
        await waitFor(() => expect(result.current.recent).toEqual(['a', 'b']))

        await act(async () => result.current.removeRecent('a'))

        expect(result.current.recent).toEqual(['b'])
        expect(mockStorage.setItem).toHaveBeenCalledWith(
            STORAGE_KEYS.RECENT_NOTES,
            JSON.stringify(['b'])
        )
    })

    test('clears every recent note and persists the empty list', async () => {
        const { result } = await setup(JSON.stringify(['a', 'b']))
        await waitFor(() => expect(result.current.recent).toEqual(['a', 'b']))

        await act(async () => result.current.clearRecent())

        expect(result.current.recent).toEqual([])
        expect(mockStorage.setItem).toHaveBeenCalledWith(
            STORAGE_KEYS.RECENT_NOTES,
            JSON.stringify([])
        )
    })

    test('reloads the stored list on refresh', async () => {
        const { result } = await setup(JSON.stringify(['a']))
        await waitFor(() => expect(result.current.recent).toEqual(['a']))
        mockStorage.getItem.mockResolvedValue(JSON.stringify(['z']))

        await act(async () => result.current.refresh())

        expect(result.current.recent).toEqual(['z'])
    })
})
