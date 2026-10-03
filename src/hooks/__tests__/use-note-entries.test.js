import { renderHook } from '@testing-library/react-native'

import { useNoteEntries } from '../use-note-entries'

let mockNotes = []

jest.mock('../use-notes', () => ({
    useNotes: () => ({
        notes: mockNotes,
        notePaths: new Map(mockNotes.map((note) => [note.path, 'work']))
    })
}))

beforeEach(() => {
    mockNotes = [
        { path: 'r::A.md', title: 'A' },
        { path: 'r::B.md', title: '' }
    ]
})

describe('note entries', () => {
    test('lists titled notes with their folder path', async () => {
        const { result } = await renderHook(() => useNoteEntries())

        expect(result.current).toEqual([
            { id: 'r::A.md', title: 'A', aliases: [], path: 'work' }
        ])
    })

    test('keeps the same reference when the entries do not change', async () => {
        const { result, rerender } = await renderHook(() => useNoteEntries())
        const first = result.current

        mockNotes = mockNotes.map((note) => ({ ...note }))
        await rerender()

        expect(result.current).toBe(first)
    })

    test('returns a new reference when the entries change', async () => {
        const { result, rerender } = await renderHook(() => useNoteEntries())
        const first = result.current

        mockNotes = [...mockNotes, { path: 'r::C.md', title: 'C' }]
        await rerender()

        expect(result.current).not.toBe(first)
        expect(result.current).toHaveLength(2)
    })
})
