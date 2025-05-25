import { createContext, useState } from 'react'
import { DEFAULT_SORT } from '@/constants'

export const UtilsContext = createContext()

export function UtilsProvider({ children }) {
    const [pinned, setPinned] = useState(new Set())
    const [sort, setSort] = useState(DEFAULT_SORT)
    const [filter, setFilter] = useState(new Set())
    const [markdown, setMarkdown] = useState(true)
    const [hasMarkdown, setHasMarkdown] = useState(false)

    return (
        <UtilsContext.Provider
            value={{
                pinned,
                setPinned,
                sort,
                setSort,
                filter,
                setFilter,
                markdown,
                setMarkdown,
                hasMarkdown,
                setHasMarkdown
            }}
        >
            {children}
        </UtilsContext.Provider>
    )
}
