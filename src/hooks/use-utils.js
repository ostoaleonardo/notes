import { useContext } from 'react'
import { UtilsContext } from '@/context'
import { useStorage } from './use-storage'
import { STORAGE_KEYS } from '@/constants'

export const useUtils = () => {
    const {
        pinned, setPinned,
        sort, setSort,
        filter, setFilter,
        view, setView
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

    const updateView = (view) => {
        setView(view)
        setItem(STORAGE_KEYS.VIEW, view)
    }

    const onPinned = (id) => {
        const next = new Set(pinned)

        if (next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }

        updatePinned(next)
    }

    const onFilter = (id) => {
        if (id === 'all') {
            setFilter(new Set())
            return
        }

        const next = new Set(filter)

        if (next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }

        setFilter(next)
    }

    return {
        pinned,
        sort,
        filter,
        view,
        updatePinned,
        updateSort,
        updateView,
        onFilter,
        onPinned
    }
}
