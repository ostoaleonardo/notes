import { useContext } from 'react'
import { UtilsContext } from '@/context'
import { useStorage } from './use-storage'
import { STORAGE_KEYS } from '@/constants'

export const useUtils = () => {
    const {
        pinned, setPinned,
        sort, setSort,
        filter, setFilter
    } = useContext(UtilsContext)

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

    const onFilter = (id) => {
        if (id === 'all') {
            setFilter(new Set())
            return
        }

        if (filter.has(id)) {
            filter.delete(id)
        } else {
            filter.add(id)
        }

        setFilter(new Set(filter))
    }

    return {
        pinned,
        sort,
        filter,
        updatePinned,
        updateSort,
        onFilter
    }
}
