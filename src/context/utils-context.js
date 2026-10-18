import { createContext, useEffect, useMemo, useState } from 'react'

import { useStorage } from '@/hooks/use-storage'

import { STORAGE_KEYS } from '@/constants/storage-keys'

export const UtilsContext = createContext()

export function UtilsProvider({ children }) {
    const [pinned, setPinned] = useState(new Set())
    const [collapsedFolders, setCollapsedFolders] = useState(new Set())
    const [drawerFolderId, setDrawerFolderId] = useState(null)

    const { getItem } = useStorage()

    useEffect(() => {
        const getUtils = async () => {
            const pinned = await getItem(STORAGE_KEYS.PINNED)
            const collapsedFolders = await getItem(STORAGE_KEYS.COLLAPSED_FOLDERS)

            if (pinned) setPinned(new Set(JSON.parse(pinned)))
            if (collapsedFolders) setCollapsedFolders(new Set(JSON.parse(collapsedFolders)))
        }

        getUtils()
    }, [getItem])

    const value = useMemo(() => ({
        pinned,
        setPinned,
        collapsedFolders,
        setCollapsedFolders,
        drawerFolderId,
        setDrawerFolderId
    }), [pinned, collapsedFolders, drawerFolderId])

    return (
        <UtilsContext.Provider value={value}>
            {children}
        </UtilsContext.Provider>
    )
}
