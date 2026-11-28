import { act, renderHook } from '@testing-library/react-native'

import { useNoteBodies } from '../use-note-bodies'

jest.mock('repository-engine', () => ({ __esModule: true, default: {} }))

const NOTES = [{ path: 'a' }]

describe('use note bodies', () => {
    test('returns the loaded bodies', async () => {
        const loaded = new Map([['a', 'Body']])
        const loader = { load: jest.fn(async () => loaded) }

        const { result } = await renderHook(() => useNoteBodies(NOTES, loader))

        expect(result.current).toBe(loaded)
        expect(loader.load).toHaveBeenCalledWith(NOTES)
    })

    test('loads again when the notes change', async () => {
        const loader = { load: jest.fn(async () => new Map()) }
        const { rerender } = await renderHook(({ notes }) => useNoteBodies(notes, loader), {
            initialProps: { notes: NOTES }
        })

        await rerender({ notes: [{ path: 'b' }] })
        await act(async () => {})

        expect(loader.load).toHaveBeenCalledTimes(2)
    })

    test('ignores a result that arrives after the notes changed', async () => {
        let release
        const slow = new Promise((resolve) => { release = resolve })
        const loader = {
            load: jest.fn()
                .mockReturnValueOnce(slow)
                .mockResolvedValueOnce(new Map([['b', 'Fresh']]))
        }
        const { result, rerender } = await renderHook(({ notes }) => useNoteBodies(notes, loader), {
            initialProps: { notes: NOTES }
        })

        await rerender({ notes: [{ path: 'b' }] })
        await act(async () => {})
        await act(async () => release(new Map([['a', 'Stale']])))

        expect(result.current.get('b')).toBe('Fresh')
    })
})
