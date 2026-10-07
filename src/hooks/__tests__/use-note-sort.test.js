import { act, renderHook } from '@testing-library/react-native'

import { useNoteSort } from '../use-note-sort'
import { DEFAULT_NOTE_SORT, NOTE_SORTS } from '@/constants/note-sort'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const mockSetItem = jest.fn()
const mockUseStorageEffect = jest.fn()

jest.mock('../use-storage', () => ({
    useStorage: () => ({ setItem: mockSetItem })
}))

jest.mock('../use-storage-effect', () => ({
    useStorageEffect: (...args) => mockUseStorageEffect(...args)
}))

const restoreStored = async (result, stored) => {
    const [, onValue] = mockUseStorageEffect.mock.calls[0]

    await act(async () => onValue(stored))

    return result
}

describe('note sort', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('starts with the default sort', async () => {
        const { result } = await renderHook(() => useNoteSort())

        expect(result.current.sort).toBe(DEFAULT_NOTE_SORT)
    })

    test('reads the sort from the note sort storage key', async () => {
        await renderHook(() => useNoteSort())

        expect(mockUseStorageEffect.mock.calls[0][0]).toBe(STORAGE_KEYS.NOTE_SORT)
    })

    test('restores a stored sort', async () => {
        const { result } = await renderHook(() => useNoteSort())

        await restoreStored(result, NOTE_SORTS.MODIFIED_DESC)

        expect(result.current.sort).toBe(NOTE_SORTS.MODIFIED_DESC)
    })

    test('ignores an unknown stored sort', async () => {
        const { result } = await renderHook(() => useNoteSort())

        await restoreStored(result, 'invalid')

        expect(result.current.sort).toBe(DEFAULT_NOTE_SORT)
    })

    test('changes and persists the sort', async () => {
        const { result } = await renderHook(() => useNoteSort())

        await act(async () => result.current.onChangeSort(NOTE_SORTS.CREATED_ASC))

        expect(result.current.sort).toBe(NOTE_SORTS.CREATED_ASC)
        expect(mockSetItem).toHaveBeenCalledWith(
            STORAGE_KEYS.NOTE_SORT,
            NOTE_SORTS.CREATED_ASC
        )
    })
})
