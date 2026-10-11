import { act, renderHook } from '@testing-library/react-native'

import { useCurrentNote } from '../use-current-note'
import { CurrentNoteContext } from '@/context/current-note-context'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { RECENT_NOTES_LIMIT } from '@/constants/default-values'

const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
}
const mockRefresh = jest.fn()
const mockSetCurrentId = jest.fn()

jest.mock('../use-storage', () => ({
    useStorage: () => mockStorage
}))

jest.mock('../use-recent-notes', () => ({
    useRecentNotes: () => ({ refresh: mockRefresh })
}))

jest.mock('expo-router', () => ({
    useFocusEffect: jest.fn()
}))

const wrapper = ({ children }) => (
    <CurrentNoteContext.Provider
        value={{ currentId: 'a', setCurrentId: mockSetCurrentId }}
    >
        {children}
    </CurrentNoteContext.Provider>
)

const setup = () => renderHook(() => useCurrentNote(), { wrapper })

const storedRecents = (ids) => {
    mockStorage.getItem.mockImplementation(async (key) => (
        key === STORAGE_KEYS.RECENT_NOTES ? JSON.stringify(ids) : null
    ))
}

describe('register current note', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockStorage.setItem.mockResolvedValue()
    })

    test('exposes the current id from context', async () => {
        storedRecents([])

        const { result } = await setup()

        expect(result.current.currentId).toBe('a')
    })

    test('stores the id as the current note', async () => {
        storedRecents([])
        const { result } = await setup()

        await act(async () => result.current.registerCurrent('n1'))

        expect(mockSetCurrentId).toHaveBeenCalledWith('n1')
        expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_NOTE, 'n1')
    })

    test('moves an existing note to the front of the recent list', async () => {
        storedRecents(['a', 'b', 'c'])
        const { result } = await setup()

        await act(async () => result.current.registerCurrent('c'))

        expect(mockStorage.setItem).toHaveBeenCalledWith(
            STORAGE_KEYS.RECENT_NOTES,
            JSON.stringify(['c', 'a', 'b'])
        )
        expect(mockRefresh).toHaveBeenCalled()
    })

    test('starts the recent list when none is stored', async () => {
        mockStorage.getItem.mockResolvedValue(null)
        const { result } = await setup()

        await act(async () => result.current.registerCurrent('n1'))

        expect(mockStorage.setItem).toHaveBeenCalledWith(
            STORAGE_KEYS.RECENT_NOTES,
            JSON.stringify(['n1'])
        )
    })

    test('caps the recent list at the limit', async () => {
        const ids = Array.from({ length: RECENT_NOTES_LIMIT }, (_, index) => `id-${index}`)
        storedRecents(ids)
        const { result } = await setup()

        await act(async () => result.current.registerCurrent('new'))

        const saved = JSON.parse(mockStorage.setItem.mock.calls.at(-1)[1])
        expect(saved).toHaveLength(RECENT_NOTES_LIMIT)
        expect(saved[0]).toBe('new')
        expect(saved).not.toContain(ids.at(-1))
    })

    test('clears the current note without touching the recent list', async () => {
        storedRecents(['a'])
        const { result } = await setup()

        await act(async () => result.current.registerCurrent(''))

        expect(mockSetCurrentId).toHaveBeenCalledWith('')
        expect(mockStorage.setItem).toHaveBeenCalledTimes(1)
        expect(mockRefresh).not.toHaveBeenCalled()
    })
})
