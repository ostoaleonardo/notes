import { renderHook } from '@testing-library/react-native'

import { useNoteLookup } from '../use-note-lookup'

let mockNotes = []

jest.mock('@/shared/hooks/use-notes', () => ({
    useNotes: () => ({
        notes: mockNotes,
        notePaths: new Map(mockNotes.map((note) => [note.path, 'work'])),
        getNote: (path) => mockNotes.find((note) => note.path === path) || {}
    })
}))

beforeEach(() => {
    mockNotes = [
        { path: 'r::Alpha.md', title: 'Alpha', note: '' },
        { path: 'r::Beta.md', title: 'Beta', note: '' }
    ]
})

describe('note lookup', () => {
    test('resolves which link targets point to a note', async () => {
        const { result } = await renderHook(() => useNoteLookup('r::Alpha.md'))

        expect(await result.current.onResolveLinks(['Alpha', 'Missing'])).toEqual({
            Alpha: true,
            Missing: false
        })
    })

    test('searches notes by title', async () => {
        const { result } = await renderHook(() => useNoteLookup('r::Alpha.md'))

        const matches = await result.current.onSearchNotes('bet')

        expect(matches.map(({ title }) => title)).toEqual(['Beta'])
    })

    test('keeps the version while the notes do not change', async () => {
        const { result, rerender } = await renderHook(() => useNoteLookup('r::Alpha.md'))
        const first = result.current.linkVersion

        mockNotes = mockNotes.map((note) => ({ ...note }))
        await rerender()

        expect(result.current.linkVersion).toBe(first)
    })

    test('changes the version when a note is added', async () => {
        const { result, rerender } = await renderHook(() => useNoteLookup('r::Alpha.md'))
        const first = result.current.linkVersion

        mockNotes = [...mockNotes, { path: 'r::Gamma.md', title: 'Gamma', note: '' }]
        await rerender()

        expect(result.current.linkVersion).toBeGreaterThan(first)
    })
})
