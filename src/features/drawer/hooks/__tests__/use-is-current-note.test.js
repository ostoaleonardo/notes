import { act, renderHook } from '@testing-library/react-native'

import { useIsCurrentNote } from '../use-is-current-note'
import { setCurrentNoteId } from '@/shared/utils/current-note-store'

beforeEach(() => {
    setCurrentNoteId('')
})

describe('is current note', () => {
    test('is false until the note becomes the current one', async () => {
        const { result } = await renderHook(() => useIsCurrentNote('r::A.md'))

        expect(result.current).toBe(false)

        await act(async () => setCurrentNoteId('r::A.md'))

        expect(result.current).toBe(true)
    })

    test('turns false again when another note becomes current', async () => {
        setCurrentNoteId('r::A.md')
        const { result } = await renderHook(() => useIsCurrentNote('r::A.md'))

        await act(async () => setCurrentNoteId('r::B.md'))

        expect(result.current).toBe(false)
    })

    test('only the rows whose answer changes render again', async () => {
        let renders = 0
        const { result } = await renderHook(() => {
            renders += 1
            return useIsCurrentNote('r::Other.md')
        })
        const before = renders

        await act(async () => setCurrentNoteId('r::A.md'))
        await act(async () => setCurrentNoteId('r::B.md'))

        expect(result.current).toBe(false)
        expect(renders).toBe(before)
    })
})
