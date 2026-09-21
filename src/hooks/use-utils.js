import { useContext } from 'react'

import { useStorage } from './use-storage'
import { UtilsContext } from '@/context/utils-contex'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export const useUtils = () => {
    const {
        pinned, setPinned,
        collapsedFolders, setCollapsedFolders
    } = useContext(UtilsContext)

    const { setItem } = useStorage()

    const updatePinned = (pinned) => {
        setPinned(pinned)
        setItem(
            STORAGE_KEYS.PINNED,
            JSON.stringify(Array.from(pinned))
        )
    }

    const onPinned = (id) => {
        const next = new Set(pinned)

        if (next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }

        updatePinned(next)
    }

    const updateCollapsedFolders = (collapsedFolders) => {
        setCollapsedFolders(collapsedFolders)
        setItem(
            STORAGE_KEYS.COLLAPSED_FOLDERS,
            JSON.stringify(Array.from(collapsedFolders))
        )
    }

    const toggleFolder = (id) => {
        const next = new Set(collapsedFolders)

        if (next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }

        updateCollapsedFolders(next)
    }

    const collapseAll = (ids) => updateCollapsedFolders(new Set(ids))
    const expandAll = () => updateCollapsedFolders(new Set())

    return {
        pinned,
        collapsedFolders,
        updatePinned,
        onPinned,
        toggleFolder,
        collapseAll,
        expandAll
    }
}
