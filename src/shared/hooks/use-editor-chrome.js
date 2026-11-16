import { useCallback, useState } from 'react'

import { useAllowLandscape } from './use-allow-landscape'
import { useBottomSheet } from './use-bottom-sheet'
import { useMarkdownAction } from './use-markdown-action'
import { useMarkdownSearch } from './use-markdown-search'
import { useMarkdownSheets } from './use-markdown-sheets'
import { useUndoRedoState } from './use-undo-redo-state'

export function useEditorChrome() {
    useAllowLandscape()

    const [isFocused, setIsFocused] = useState(false)
    const onFocus = useCallback(() => setIsFocused(true), [])
    const onBlur = useCallback(() => setIsFocused(false), [])

    const recentsSheet = useBottomSheet()
    const searchSheet = useBottomSheet()
    const action = useMarkdownAction()
    const search = useMarkdownSearch()
    const undoRedo = useUndoRedoState()
    const insertSheets = useMarkdownSheets(action)

    return {
        isFocused,
        onFocus,
        onBlur,
        recentsSheet,
        searchSheet,
        action,
        search,
        ...undoRedo,
        ...insertSheets
    }
}
