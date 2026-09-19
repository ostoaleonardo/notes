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

    const onOpenReplace = useCallback(() => {
        setVisible(true)
        setReplaceVisible(true)
    }, [])

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
        onOpenReplace,
        onClose
    }
}
