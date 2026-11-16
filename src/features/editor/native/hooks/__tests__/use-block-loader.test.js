import { renderHook } from '@testing-library/react-native'

import { useBlockLoader } from '../use-block-loader'

const mockNotes = new Map([
    ['r::A.md', { path: 'r::A.md', title: 'A', note: 'Key idea ^idea\n\nPlain paragraph' }]
])

const ENTRIES = [{ id: 'r::A.md', title: 'A', aliases: [], path: '' }]

jest.mock('../../../../../shared/hooks/use-notes', () => ({
    useNotes: () => ({ getNote: (path) => mockNotes.get(path) || {} })
}))

describe('block loader', () => {
    test('loads the blocks of the note a link target points to', async () => {
        const { result } = await renderHook(() => useBlockLoader('r::B.md', ENTRIES))

        expect(await result.current('A')).toEqual({
            path: 'r::A.md',
            labeled: [{ id: 'idea', preview: 'Key idea' }],
            unlabeled: [{ preview: 'Plain paragraph' }]
        })
    })

    test('hides the unlabeled blocks of the note being edited', async () => {
        const { result } = await renderHook(() => useBlockLoader('r::A.md', ENTRIES))

        expect((await result.current('A')).unlabeled).toEqual([])
    })

    test('returns nothing for a target that matches no note', async () => {
        const { result } = await renderHook(() => useBlockLoader('r::B.md', ENTRIES))

        expect(await result.current('Missing')).toBeNull()
    })
})
