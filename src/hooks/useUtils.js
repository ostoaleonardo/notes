import { useContext } from 'react'
import { UtilsContext } from '@/context'
import { useStorage } from './useStorage'
import { STORAGE_KEYS } from '@/constants'

export const useUtils = () => {
    const { pinned, setPinned, sort, setSort } = useContext(UtilsContext)
    const { setItem } = useStorage()

    const updatePinned = (pinned) => {
        setPinned(pinned)
        setItem(
            STORAGE_KEYS.PINNED,
            JSON.stringify(Array.from(pinned))
        )
    }

    const updateSort = (sort) => {
        setSort(sort)
        setItem(
            STORAGE_KEYS.SORT,
            JSON.stringify(sort)
        )
    }

    return {
        pinned,
        sort,
        updatePinned,
        updateSort
    }
}
