import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRepositories } from './use-repositories'
import { useStorage } from './use-storage'
import { useStorageEffect } from './use-storage-effect'
import { scopedStorageKey } from '@/utils/scoped-storage-key'

import { MENU } from '@/constants/components'

export function useFolderSetting(storageKey, rootLabel) {
    const { setItem } = useStorage()
    const { activeRepository, getDescendants } = useRepositories()

    const [folderId, setFolderId] = useState('')

    const scopedKey = activeRepository ? scopedStorageKey(storageKey, activeRepository.id) : null

    useEffect(() => setFolderId(''), [scopedKey])
    useStorageEffect(scopedKey, (value) => {
        if (value) setFolderId(value)
    })

    const onSelect = useCallback((id) => {
        setFolderId(id)
        if (scopedKey) setItem(scopedKey, id)
    }, [scopedKey, setItem])

    const descendants = useMemo(() => (
        activeRepository ? getDescendants(activeRepository.id) : []
    ), [activeRepository, getDescendants])

    const items = useMemo(() => [
        { value: '', title: rootLabel },
        ...descendants.map((repository) => ({
            value: repository.id,
            title: repository.alias,
            contentStyle: { paddingLeft: repository.depth * MENU.itemIndent }
        }))
    ], [descendants, rootLabel])

    const selected = descendants.find((repository) => repository.id === folderId)

    return {
        items,
        onSelect,
        selectedValue: folderId,
        description: selected ? selected.alias : rootLabel
    }
}
