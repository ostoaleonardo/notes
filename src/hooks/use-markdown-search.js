import { useCallback, useState } from 'react'

export function useMarkdownSearch() {
    const [visible, setVisible] = useState(false)
    const [replaceVisible, setReplaceVisible] = useState(false)
    const [query, setQuery] = useState('')
    const [replacement, setReplacement] = useState('')

    const onOpenSearch = useCallback(() => {
        setVisible(true)
        setReplaceVisible(false)
    }, [])

    const onOpenReplace = useCallback(() => {
        setVisible(true)
        setReplaceVisible(true)
    }, [])

    const onClose = useCallback(() => {
        setVisible(false)
        setReplaceVisible(false)
        setQuery('')
        setReplacement('')
    }, [])

    return {
        visible,
        replaceVisible,
        query,
        setQuery,
        replacement,
        setReplacement,
        onOpenSearch,
        onOpenReplace,
        onClose
    }
}
