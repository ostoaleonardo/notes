import { createContext, useState } from 'react'
import { DEFAULT_SORT } from '@/constants'

export const UtilsContext = createContext()

export function UtilsProvider({ children }) {
    const [pinned, setPinned] = useState(new Set())
    const [sort, setSort] = useState(DEFAULT_SORT)
    const [filter, setFilter] = useState(new Set())

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
