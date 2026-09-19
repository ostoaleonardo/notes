import { act, renderHook } from '@testing-library/react-native'

import { useMarkdownSearch } from '../use-markdown-search'

describe('open search', () => {
    test('shows the search bar without the replace field', async () => {
        const { result } = await renderHook(() => useMarkdownSearch())

        await act(() => {
            result.current.onOpenSearch()
        })

        expect(result.current.visible).toBe(true)
        expect(result.current.replaceVisible).toBe(false)
    })
})

describe('open replace', () => {
    test('shows both the search and replace fields', async () => {
        const { result } = await renderHook(() => useMarkdownSearch())

        await act(() => {
            result.current.onOpenReplace()
        })

        expect(result.current.visible).toBe(true)
        expect(result.current.replaceVisible).toBe(true)
    })
})

describe('close', () => {
    test('hides the bar and clears the query and replacement text', async () => {
        const { result } = await renderHook(() => useMarkdownSearch())

        await act(() => {
            result.current.onOpenReplace()
            result.current.setSearchQuery('todo')
            result.current.setReplaceText('done')
        })

        await act(() => {
            result.current.onClose()
        })

        expect(result.current.visible).toBe(false)
        expect(result.current.replaceVisible).toBe(false)
        expect(result.current.searchQuery).toBe('')
        expect(result.current.replaceText).toBe('')
    })
})
