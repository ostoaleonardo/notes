import { useContext, useEffect } from 'react'
import { UtilsContext } from '@/context'
import { useStorage } from './useStorage'
import { STORAGE_KEYS } from '@/constants'

export const useMarkdown = () => {
    const {
        markdown, setMarkdown,
        hasMarkdown, setHasMarkdown
    } = useContext(UtilsContext)

    const { setItem, getItem } = useStorage()

    const toggleMarkdown = async (markdown) => {
        setMarkdown(markdown)
        setItem(STORAGE_KEYS.MARKDOWN, JSON.stringify(markdown))
    }

    const initMarkdown = async () => {
        const isEnable = await getItem(STORAGE_KEYS.MARKDOWN)
        const enableMarkdown = isEnable ? JSON.parse(isEnable) : true
        setMarkdown(enableMarkdown)
    }

    return {
        markdown,
        initMarkdown,
        toggleMarkdown,
        hasMarkdown,
        setHasMarkdown
    }
}
