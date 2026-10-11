import { act, renderHook, waitFor } from '@testing-library/react-native'

import { useShowProperties } from '../use-show-properties'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { STORAGE_BOOLEAN } from '@/constants/storage-values'

const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
}

jest.mock('../use-storage', () => ({
    useStorage: () => mockStorage
}))

describe('show note properties', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockStorage.getItem.mockResolvedValue(null)
    })

    test('shows the properties by default', async () => {
        const { result } = await renderHook(() => useShowProperties())

        expect(result.current.propertiesVisible).toBe(true)
    })

    test('hides the properties when the stored value is false', async () => {
        mockStorage.getItem.mockResolvedValue(STORAGE_BOOLEAN.FALSE)

        const { result } = await renderHook(() => useShowProperties())

        await waitFor(() => expect(result.current.propertiesVisible).toBe(false))
    })

    test('toggles the visibility and persists the new value', async () => {
        const { result } = await renderHook(() => useShowProperties())

        await act(async () => result.current.onToggleProperties())

        expect(result.current.propertiesVisible).toBe(false)
        expect(mockStorage.setItem).toHaveBeenCalledWith(
            STORAGE_KEYS.SHOW_NOTE_PROPERTIES,
            STORAGE_BOOLEAN.FALSE
        )

        await act(async () => result.current.onToggleProperties())

        expect(result.current.propertiesVisible).toBe(true)
        expect(mockStorage.setItem).toHaveBeenLastCalledWith(
            STORAGE_KEYS.SHOW_NOTE_PROPERTIES,
            STORAGE_BOOLEAN.TRUE
        )
    })
})
