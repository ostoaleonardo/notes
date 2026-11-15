import { renderHook } from '@testing-library/react-native'

import { useBlockLoader } from '../use-block-loader'

const mockNotes = new Map([
    ['r::A.md', { path: 'r::A.md', title: 'A', note: 'Key idea ^idea\n\nPlain paragraph' }]
])

jest.mock('../use-notes', () => ({
    useNotes: () => ({ getNote: (path) => mockNotes.get(path) || {} })
}))

describe('block loader', () => {
    test('loads the labeled and unlabeled blocks of a note', async () => {
        const { result } = await renderHook(() => useBlockLoader('r::B.md'))

        expect(await result.current('r::A.md')).toEqual({
            labeled: [{ id: 'idea', preview: 'Key idea' }],
            unlabeled: [{ preview: 'Plain paragraph' }]
        })
    })

    test('hides the unlabeled blocks of the note being edited', async () => {
        const { result } = await renderHook(() => useBlockLoader('r::A.md'))

        expect((await result.current('r::A.md')).unlabeled).toEqual([])
    })

    test('returns no blocks for an unknown note', async () => {
        const { result } = await renderHook(() => useBlockLoader('r::B.md'))

        expect(await result.current('r::Missing.md')).toEqual({ labeled: [], unlabeled: [] })
    })
})
