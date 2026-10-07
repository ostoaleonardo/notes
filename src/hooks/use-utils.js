import { useCallback, useContext, useMemo } from 'react'

import { useStorage } from './use-storage'
import { toggleInSet } from '@/utils/toggle-in-set'
import { UtilsContext } from '@/context/utils-context'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export const useUtils = () => {
    const {
        pinned, setPinned,
        collapsedFolders, setCollapsedFolders
    } = useContext(UtilsContext)

    const { setItem } = useStorage()

    const updatePinned = useCallback((next) => {
        setPinned(next)
        setItem(
            STORAGE_KEYS.PINNED,
            JSON.stringify(Array.from(next))
        )
    }, [setPinned, setItem])

    const onPinned = useCallback(
        (id) => updatePinned(toggleInSet(pinned, id)),
        [pinned, updatePinned]
    )

    const updateCollapsedFolders = useCallback((next) => {
        setCollapsedFolders(next)
        setItem(
            STORAGE_KEYS.COLLAPSED_FOLDERS,
            JSON.stringify(Array.from(next))
        )
    }, [setCollapsedFolders, setItem])

    const toggleFolder = useCallback(
        (id) => updateCollapsedFolders(toggleInSet(collapsedFolders, id)),
        [collapsedFolders, updateCollapsedFolders]
    )

    const collapseAll = useCallback(
        (ids) => updateCollapsedFolders(new Set(ids)),
        [updateCollapsedFolders]
    )

    const expandAll = useCallback(
        () => updateCollapsedFolders(new Set()),
        [updateCollapsedFolders]
    )

    const setFoldersCollapsed = useCallback((ids, collapsed) => {
        const next = new Set(collapsedFolders)

        ids.forEach((id) => (collapsed ? next.add(id) : next.delete(id)))
        updateCollapsedFolders(next)
    }, [collapsedFolders, updateCollapsedFolders])

    return useMemo(() => ({
        pinned,
        collapsedFolders,
        updatePinned,
        onPinned,
        toggleFolder,
        collapseAll,
        expandAll,
        setFoldersCollapsed
    }), [
        pinned,
        collapsedFolders,
        updatePinned,
        onPinned,
        toggleFolder,
        collapseAll,
        expandAll,
        setFoldersCollapsed
    ])
}
