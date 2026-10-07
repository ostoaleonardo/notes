import { useEffect } from 'react'
import { closeSearchPanel, openSearchPanel, setSearchQuery, SearchQuery } from '@codemirror/search'

export const useEditorSearch = (viewRef, searchQuery, replaceText) => {
    useEffect(() => {
        const view = viewRef.current
        if (!view) return

        if (searchQuery) {
            openSearchPanel(view)
        } else {
            closeSearchPanel(view)
        }

        view.dispatch({
            effects: setSearchQuery.of(new SearchQuery({ search: searchQuery || '', replace: replaceText || '' }))
        })
    }, [viewRef, searchQuery, replaceText])
}
