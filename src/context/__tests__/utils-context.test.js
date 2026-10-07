import { useContext } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import { UtilsContext, UtilsProvider } from '../utils-context'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const mockStorage = {
    getItem: jest.fn()
}

jest.mock('@/hooks/use-storage', () => ({
    useStorage: () => mockStorage
}))

const stubStorage = (values) => {
    mockStorage.getItem.mockImplementation(async (key) => values[key] ?? null)
}

const setup = () => renderHook(() => useContext(UtilsContext), { wrapper: UtilsProvider })

describe('utils context', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('starts with empty pinned and collapsed sets', async () => {
        stubStorage({})

        const { result } = await setup()

        expect(result.current.pinned.size).toBe(0)
        expect(result.current.collapsedFolders.size).toBe(0)
    })

    test('loads pinned notes and collapsed folders from storage', async () => {
        stubStorage({
            [STORAGE_KEYS.PINNED]: JSON.stringify(['a', 'b']),
            [STORAGE_KEYS.COLLAPSED_FOLDERS]: JSON.stringify(['x'])
        })

        const { result } = await setup()

        await waitFor(() => expect(result.current.pinned).toEqual(new Set(['a', 'b'])))
        expect(result.current.collapsedFolders).toEqual(new Set(['x']))
    })

    test('exposes setters that update the sets', async () => {
        stubStorage({})
        const { result } = await setup()

        await act(async () => result.current.setPinned(new Set(['n'])))
        await act(async () => result.current.setCollapsedFolders(new Set(['f'])))

        expect(result.current.pinned).toEqual(new Set(['n']))
        expect(result.current.collapsedFolders).toEqual(new Set(['f']))
    })
})
