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

describe('toggle replace', () => {
    test('shows and hides the replace field', async () => {
        const { result } = await renderHook(() => useMarkdownSearch())

        await act(() => {
            result.current.onOpenSearch()
            result.current.onToggleReplace()
        })

        expect(result.current.replaceVisible).toBe(true)

        await act(() => {
            result.current.onToggleReplace()
        })

        expect(result.current.visible).toBe(true)
        expect(result.current.replaceVisible).toBe(false)
    })
})

describe('close', () => {
    test('hides the bar and clears the query and replacement text', async () => {
        const { result } = await renderHook(() => useMarkdownSearch())

        await act(() => {
            result.current.onOpenSearch()
            result.current.onToggleReplace()
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
