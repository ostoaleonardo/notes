import { useContext } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import { CurrentNoteContext, CurrentNoteProvider } from '../current-note-context'
import { STORAGE_KEYS } from '@/constants/storage-keys'

const mockStorage = {
    getItem: jest.fn()
}

jest.mock('@/hooks/use-storage', () => ({
    useStorage: () => mockStorage
}))

const setup = () => renderHook(() => useContext(CurrentNoteContext), {
    wrapper: CurrentNoteProvider
})

describe('current note context', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('starts without a current note when nothing is stored', async () => {
        mockStorage.getItem.mockResolvedValue(null)

        const { result } = await setup()

        expect(result.current.currentId).toBe('')
    })

    test('restores the stored current note', async () => {
        mockStorage.getItem.mockResolvedValue('repo::Note.md')

        const { result } = await setup()

        await waitFor(() => expect(result.current.currentId).toBe('repo::Note.md'))
        expect(mockStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.CURRENT_NOTE)
    })

    test('updates the current note id', async () => {
        mockStorage.getItem.mockResolvedValue(null)
        const { result } = await setup()

        await act(async () => result.current.setCurrentId('other'))

        expect(result.current.currentId).toBe('other')
    })
})
