import { useCallback, useState } from 'react'

import { useStorage } from './use-storage'
import { useStorageEffect } from './use-storage-effect'

import { DEFAULT_NOTE_SORT, NOTE_SORT_LABELS } from '@/constants/note-sort'
import { STORAGE_BOOLEAN } from '@/constants/storage-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useSearchOptions() {
    const { setItem } = useStorage()
    const [sort, setSort] = useState(DEFAULT_NOTE_SORT)
    const [matchCase, setMatchCase] = useState(false)
    const [moreContext, setMoreContext] = useState(false)

    useStorageEffect(STORAGE_KEYS.SEARCH_SORT, (stored) => {
        if (NOTE_SORT_LABELS[stored]) setSort(stored)
    })

    useStorageEffect(STORAGE_KEYS.SEARCH_MATCH_CASE, (stored) => {
        setMatchCase(stored === STORAGE_BOOLEAN.TRUE)
    })

    useStorageEffect(STORAGE_KEYS.SEARCH_MORE_CONTEXT, (stored) => {
        setMoreContext(stored === STORAGE_BOOLEAN.TRUE)
    })

    const onChangeSort = useCallback((next) => {
        setSort(next)
        setItem(STORAGE_KEYS.SEARCH_SORT, next)
    }, [setItem])

    const onToggleMatchCase = useCallback(() => {
        setMatchCase((current) => {
            setItem(STORAGE_KEYS.SEARCH_MATCH_CASE, String(!current))
            return !current
        })
    }, [setItem])

    const onToggleMoreContext = useCallback(() => {
        setMoreContext((current) => {
            setItem(STORAGE_KEYS.SEARCH_MORE_CONTEXT, String(!current))
            return !current
        })
    }, [setItem])

    return { sort, matchCase, moreContext, onChangeSort, onToggleMatchCase, onToggleMoreContext }
}
