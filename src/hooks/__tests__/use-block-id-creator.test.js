import { renderHook } from '@testing-library/react-native'

import { useBlockIdCreator } from '../use-block-id-creator'

const mockGetNote = jest.fn()
const mockUpdateNote = jest.fn()
const mockAddBlockId = jest.fn()

jest.mock('../use-notes', () => ({
    useNotes: () => ({ getNote: mockGetNote, updateNote: mockUpdateNote })
}))

jest.mock('@/utils/block-refs', () => ({
    addBlockId: (...args) => mockAddBlockId(...args)
}))

const target = { path: 'a', index: 2, preview: 'text', id: 'abc' }

describe('block id creator', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockGetNote.mockReturnValue({ path: 'a', note: 'body' })
    })

    test('updates the note with the block id added', async () => {
        mockAddBlockId.mockReturnValue('body ^abc')
        const { result } = await renderHook(() => useBlockIdCreator())

        await result.current(target)

        expect(mockAddBlockId).toHaveBeenCalledWith(
            'body',
            { index: 2, preview: 'text' },
            'abc'
        )
        expect(mockUpdateNote).toHaveBeenCalledWith({ path: 'a', note: 'body ^abc' })
    })

    test('leaves the note alone when no id could be added', async () => {
        mockAddBlockId.mockReturnValue(null)
        const { result } = await renderHook(() => useBlockIdCreator())

        await result.current(target)

        expect(mockUpdateNote).not.toHaveBeenCalled()
    })

    test('keeps the same function between renders', async () => {
        const { result, rerender } = await renderHook(() => useBlockIdCreator())
        const initial = result.current

        await rerender({})

        expect(result.current).toBe(initial)
    })
})
