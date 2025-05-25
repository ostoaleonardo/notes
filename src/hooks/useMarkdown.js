import { useContext } from 'react'
import { UtilsContext } from '@/context'
import { useStorage } from './useStorage'
import { STORAGE_KEYS } from '@/constants'

export const useMarkdown = () => {
    const {
        markdown, setMarkdown,
        hasMarkdown, setHasMarkdown
    } = useContext(UtilsContext)

    const { setItem } = useStorage()

    const toggleMarkdown = async (markdown) => {
        setMarkdown(markdown)
        setItem(STORAGE_KEYS.MARKDOWN, JSON.stringify(markdown))
    }

    return {
        markdown,
        toggleMarkdown,
        hasMarkdown,
        setHasMarkdown
    }
}
