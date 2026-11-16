import { useCallback, useState } from 'react'

export function useMarkdownSearch() {
    const [visible, setVisible] = useState(false)
    const [replaceVisible, setReplaceVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [replaceText, setReplaceText] = useState('')

    const onOpenSearch = useCallback(() => {
        setVisible(true)
        setReplaceVisible(false)
    }, [])

    const onToggleReplace = useCallback(() => setReplaceVisible((current) => !current), [])

    const onClose = useCallback(() => {
        setVisible(false)
        setReplaceVisible(false)
        setSearchQuery('')
        setReplaceText('')
    }, [])

    return {
        visible,
        replaceVisible,
        searchQuery,
        setSearchQuery,
        replaceText,
        setReplaceText,
        onOpenSearch,
        onToggleReplace,
        onClose
    }
}
