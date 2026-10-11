import { renderHook, waitFor } from '@testing-library/react-native'

import { useDefaultNoteFolder } from '../use-default-note-folder'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const mockStorage = {
    getItem: jest.fn()
}
let mockActive = { id: 'root' }
let mockDescendants = [{ id: 'child' }]

jest.mock('../use-storage', () => ({
    useStorage: () => mockStorage
}))
jest.mock('../use-repositories', () => ({
    useRepositories: () => ({
        activeRepository: mockActive,
        getDescendants: () => mockDescendants
    })
}))

describe('default note folder', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockActive = { id: 'root' }
        mockDescendants = [{ id: 'child' }]
        mockStorage.getItem.mockResolvedValue(null)
    })

    test('is the repository root when nothing is stored', async () => {
        const { result } = await renderHook(() => useDefaultNoteFolder())

        expect(result.current).toBe('root')
    })

    test('is the stored folder once it loads', async () => {
        mockStorage.getItem.mockImplementation(async (key) => (
            key === `${STORAGE_KEYS.DEFAULT_NOTE_FOLDER}:root` ? 'child' : null
        ))

        const { result } = await renderHook(() => useDefaultNoteFolder())

        await waitFor(() => expect(result.current).toBe('child'))
    })

    test('ignores a stored folder that is not in the tree', async () => {
        mockStorage.getItem.mockResolvedValue('deleted')

        const { result } = await renderHook(() => useDefaultNoteFolder())

        expect(result.current).toBe('root')
    })

    test('is empty while there is no active repository', async () => {
        mockActive = null

        const { result } = await renderHook(() => useDefaultNoteFolder())

        expect(result.current).toBe('')
    })
})
