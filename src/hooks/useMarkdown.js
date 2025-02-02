import { useContext } from 'react'
import { UtilsContext } from '@/context'
import { useStorage } from './useStorage'
import { STORAGE_KEYS } from '@/constants'

export const useMarkdown = () => {
    const { markdown, setMarkdown } = useContext(UtilsContext)
    const { setItem } = useStorage()

    const toggleMarkdown = async (md) => {
        setMarkdown(md)
        setItem(STORAGE_KEYS.MARKDOWN, JSON.stringify(md))
    }

    return { markdown, toggleMarkdown }
}
