import { waitFor, renderHook } from '@testing-library/react-native'

import { useVersionDiff } from '../use-version-diff'

import { DIFF_TYPES } from '@/constants/diff'

const currentContentRef = { current: { content: 'one\ntwo' } }

describe('version diff', () => {
    test('has no diff while no version is selected', async () => {
        const { result } = await renderHook(() => useVersionDiff(null, currentContentRef))

        expect(result.current).toBeNull()
    })

    test('computes the diff against the current content once idle', async () => {
        const selected = { content: 'one\nthree' }

        const { result } = await renderHook(() => useVersionDiff(selected, currentContentRef))

        await waitFor(() => expect(result.current).not.toBeNull())
        expect(result.current.some((entry) => entry.type === DIFF_TYPES.ADDED)).toBe(true)
        expect(result.current.some((entry) => entry.type === DIFF_TYPES.REMOVED)).toBe(true)
    })

    test('clears the diff when the selection is removed', async () => {
        const { result, rerender } = await renderHook(
            ({ selected }) => useVersionDiff(selected, currentContentRef),
            { initialProps: { selected: { content: 'one\nthree' } } }
        )
        await waitFor(() => expect(result.current).not.toBeNull())

        await rerender({ selected: null })

        expect(result.current).toBeNull()
    })
})
