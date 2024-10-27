import { createContext, useState } from 'react'
import { DEFAULT_SORT } from '@/constants'

export const UtilsContext = createContext()

export function UtilsProvider({ children }) {
    const [pinned, setPinned] = useState(new Set())
    const [sort, setSort] = useState(DEFAULT_SORT)

    return (
        <UtilsContext.Provider
            value={{
                pinned,
                setPinned,
                sort,
                setSort
            }}
        >
            {children}
        </UtilsContext.Provider>
    )
}
