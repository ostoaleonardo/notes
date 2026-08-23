import { createContext, useEffect, useState } from 'react'
import { useStorage } from '../hooks/use-storage'
import { STORAGE_KEYS } from '@/constants'

export const TabsContext = createContext()

export function TabsProvider({ children }) {
    const [openTabs, setOpenTabs] = useState([])
    const [activeTabId, setActiveTabId] = useState('')
    const [pendingUnlockId, setPendingUnlockId] = useState('')
    const [tabBarActions, setTabBarActions] = useState(null)
    const [templateTitles, setTemplateTitles] = useState({})

    const { getItem } = useStorage()

    useEffect(() => {
        const getTabs = async () => {
            const tabs = await getItem(STORAGE_KEYS.OPEN_TABS)
            const active = await getItem(STORAGE_KEYS.ACTIVE_TAB)

            if (tabs) setOpenTabs(JSON.parse(tabs))
            if (active) setActiveTabId(active)
        }

        getTabs()
    }, [])

    return (
        <TabsContext.Provider
            value={{
                openTabs,
                setOpenTabs,
                activeTabId,
                setActiveTabId,
                pendingUnlockId,
                setPendingUnlockId,
                tabBarActions,
                setTabBarActions,
                templateTitles,
                setTemplateTitles
            }}
        >
            {children}
        </TabsContext.Provider>
    )
}
