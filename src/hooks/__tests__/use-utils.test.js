import { act, renderHook } from '@testing-library/react-native'

import { useUtils } from '../use-utils'
import { UtilsProvider } from '@/context/utils-context'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
}

jest.mock('../use-storage', () => ({
    useStorage: () => mockStorage
}))

const setup = () => renderHook(() => useUtils(), { wrapper: UtilsProvider })

describe('utils hook', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockStorage.getItem.mockResolvedValue(null)
    })

    test('pins a note and persists the pinned ids', async () => {
        const { result } = await setup()

        await act(async () => result.current.onPinned('a'))

        expect(result.current.pinned.has('a')).toBe(true)
        expect(mockStorage.setItem).toHaveBeenCalledWith(
            STORAGE_KEYS.PINNED,
            JSON.stringify(['a'])
        )
    })

    test('unpins a note that is already pinned', async () => {
        const { result } = await setup()

        await act(async () => result.current.onPinned('a'))
        await act(async () => result.current.onPinned('a'))

        expect(result.current.pinned.size).toBe(0)
    })

    test('toggles a folder and persists the collapsed ids', async () => {
        const { result } = await setup()

        await act(async () => result.current.toggleFolder('f'))

        expect(result.current.collapsedFolders.has('f')).toBe(true)
        expect(mockStorage.setItem).toHaveBeenCalledWith(
            STORAGE_KEYS.COLLAPSED_FOLDERS,
            JSON.stringify(['f'])
        )
    })

    test('collapses every given folder and expands them all again', async () => {
        const { result } = await setup()

        await act(async () => result.current.collapseAll(['a', 'b']))
        expect([...result.current.collapsedFolders]).toEqual(['a', 'b'])

        await act(async () => result.current.expandAll())
        expect(result.current.collapsedFolders.size).toBe(0)
    })

    test('collapses and expands only the given folders', async () => {
        const { result } = await setup()

        await act(async () => result.current.collapseAll(['a']))
        await act(async () => result.current.setFoldersCollapsed(['b', 'c'], true))
        expect([...result.current.collapsedFolders]).toEqual(['a', 'b', 'c'])

        await act(async () => result.current.setFoldersCollapsed(['a', 'b'], false))
        expect([...result.current.collapsedFolders]).toEqual(['c'])
    })

    test('keeps the same returned object while nothing changes', async () => {
        const { result, rerender } = await setup()
        const first = result.current

        await rerender()

        expect(result.current).toBe(first)
    })
})
