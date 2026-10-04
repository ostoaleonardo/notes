import { useCallback, useState } from 'react'

import { useStorage } from './use-storage'
import { useStorageEffect } from './use-storage-effect'

import { DEFAULT_NOTE_SORT, NOTE_SORT_LABELS } from '@/constants/note-sort'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useNoteSort() {
    const { setItem } = useStorage()
    const [sort, setSort] = useState(DEFAULT_NOTE_SORT)

    useStorageEffect(STORAGE_KEYS.NOTE_SORT, (stored) => {
        if (NOTE_SORT_LABELS[stored]) setSort(stored)
    })

    const onChangeSort = useCallback((next) => {
        setSort(next)
        setItem(STORAGE_KEYS.NOTE_SORT, next)
    }, [setItem])

    return { sort, onChangeSort }
}
