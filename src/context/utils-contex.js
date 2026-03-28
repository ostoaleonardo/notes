import { createContext, useEffect, useState } from 'react'
import { useStorage } from '../hooks/use-storage'
import { DEFAULT_SORT, STORAGE_KEYS } from '@/constants'

export const UtilsContext = createContext()

export function UtilsProvider({ children }) {
    const [pinned, setPinned] = useState(new Set())
    const [sort, setSort] = useState(DEFAULT_SORT)
    const [filter, setFilter] = useState(new Set())

    const { getItem } = useStorage()

    useEffect(() => {
        const getUtils = async () => {
            const pinned = await getItem(STORAGE_KEYS.PINNED)
            const sort = await getItem(STORAGE_KEYS.SORT)

            if (pinned) setPinned(new Set(JSON.parse(pinned)))
            if (sort) setSort(JSON.parse(sort))
        }

        getUtils()
    }, [])

    return (
        <UtilsContext.Provider
            value={{
                pinned,
                setPinned,
                sort,
                setSort,
                filter,
                setFilter
            }}
        >
            {children}
        </UtilsContext.Provider>
    )
}
