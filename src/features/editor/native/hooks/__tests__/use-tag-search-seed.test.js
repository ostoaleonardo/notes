import { act, renderHook } from '@testing-library/react-native'

import { useTagSearchSeed } from '../use-tag-search-seed'
import { toggleTagQualifier } from '@/utils/search-query'

describe('tag search seed', () => {
    test('starts with an empty seed', async () => {
        const { result } = await renderHook(() => useTagSearchSeed(jest.fn()))

        expect(result.current.seed).toBe('')
    })

    test('seeds the search with the pressed tag and opens it', async () => {
        const openSearch = jest.fn()
        const { result } = await renderHook(() => useTagSearchSeed(openSearch))

        await act(async () => result.current.onTagPress('work'))

        expect(result.current.seed).toBe(toggleTagQualifier('', 'work'))
        expect(openSearch).toHaveBeenCalledTimes(1)
    })

    test('clears the seed when opening the search directly', async () => {
        const openSearch = jest.fn()
        const { result } = await renderHook(() => useTagSearchSeed(openSearch))

        await act(async () => result.current.onTagPress('work'))
        await act(async () => result.current.onOpenSearch())

        expect(result.current.seed).toBe('')
        expect(openSearch).toHaveBeenCalledTimes(2)
    })
})
