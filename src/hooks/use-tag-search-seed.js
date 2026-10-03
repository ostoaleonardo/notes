import { useCallback, useState } from 'react'

import { toggleTagQualifier } from '@/utils/search-query'

export function useTagSearchSeed(openSearch) {
    const [seed, setSeed] = useState('')

    const onOpenSearch = useCallback(() => {
        setSeed('')
        openSearch()
    }, [openSearch])

    const onTagPress = useCallback((name) => {
        setSeed(toggleTagQualifier('', name))
        openSearch()
    }, [openSearch])

    return { seed, onOpenSearch, onTagPress }
}
