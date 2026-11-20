import { useCallback, useEffect, useMemo, useState } from 'react'

import { useFolders } from '@/shared/hooks/use-folders'
import { useStorage } from '@/shared/hooks/use-storage'
import { useStorageEffect } from '@/shared/hooks/use-storage-effect'
import { scopedStorageKey } from '@/shared/utils/scoped-storage-key'

import { SPACING } from '@/shared/constants/theme'

export function useFolderSetting(storageKey, rootLabel) {
    const { setItem } = useStorage()
    const { activeFolder, getDescendants } = useFolders()

    const [folderId, setFolderId] = useState('')

    const scopedKey = activeFolder ? scopedStorageKey(storageKey, activeFolder.id) : null

    useEffect(() => setFolderId(''), [scopedKey])
    useStorageEffect(scopedKey, (value) => {
        if (value) setFolderId(value)
    })

    const onSelect = useCallback((id) => {
        setFolderId(id)
        if (scopedKey) setItem(scopedKey, id)
    }, [scopedKey, setItem])

    const descendants = useMemo(() => (
        activeFolder ? getDescendants(activeFolder.id) : []
    ), [activeFolder, getDescendants])

    const items = useMemo(() => [
        { value: '', title: rootLabel },
        ...descendants.map((folder) => ({
            value: folder.id,
            title: folder.alias,
            indent: folder.depth * SPACING.lg
        }))
    ], [descendants, rootLabel])

    const selected = descendants.find((folder) => folder.id === folderId)

    return {
        items,
        onSelect,
        selectedValue: folderId,
        description: selected ? selected.alias : rootLabel
    }
}
