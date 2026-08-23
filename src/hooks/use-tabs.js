import { useContext } from 'react'
import { router } from 'expo-router'
import { TabsContext } from '@/context'
import { useStorage } from './use-storage'
import { useUtils } from './use-utils'
import { useNotes } from './use-notes'
import { ROUTES, STORAGE_KEYS, TEMPLATE_TAB_PREFIX } from '@/constants'

export function useTabs() {
    const {
        openTabs, setOpenTabs,
        activeTabId, setActiveTabId,
        pendingUnlockId, setPendingUnlockId,
        tabBarActions, setTabBarActions,
        templateTitles, setTemplateTitles
    } = useContext(TabsContext)

    const { setItem } = useStorage()
    const { pinned } = useUtils()
    const { notes } = useNotes()

    const persistTabs = (tabs) => {
        setOpenTabs(tabs)
        setItem(STORAGE_KEYS.OPEN_TABS, JSON.stringify(tabs))
    }

    const persistActiveTab = (id) => {
        setActiveTabId(id)
        setItem(STORAGE_KEYS.ACTIVE_TAB, id)
    }

    const registerTab = (id) => {
        if (!openTabs.includes(id)) persistTabs([...openTabs, id])
        persistActiveTab(id)
    }

    const navigateToTab = (id) => {
        registerTab(id)

        if (id.startsWith(TEMPLATE_TAB_PREFIX)) {
            router.push(ROUTES.EDIT_TEMPLATE + encodeURIComponent(id.slice(TEMPLATE_TAB_PREFIX.length)))
        } else {
            router.push(ROUTES.EDIT_NOTE + id)
        }
    }

    const isLocked = (id) => {
        const note = notes.find((n) => n.id === id)
        return !!(note && (note.password || note.biometrics))
    }

    const openTab = (id) => {
        if (isLocked(id)) {
            setPendingUnlockId(id)
        } else {
            navigateToTab(id)
        }
    }

    const confirmUnlock = () => {
        if (!pendingUnlockId) return
        navigateToTab(pendingUnlockId)
        setPendingUnlockId('')
    }

    const cancelUnlock = () => setPendingUnlockId('')

    const setTemplateTitle = (id, title) => {
        setTemplateTitles((prev) => ({ ...prev, [id]: title }))
    }

    const closeTab = (id) => {
        if (pinned.has(id)) return

        const remainingOpenTabs = openTabs.filter((tabId) => tabId !== id)
        persistTabs(remainingOpenTabs)

        if (activeTabId !== id) return

        const remainingTabs = Array.from(new Set([...remainingOpenTabs, ...pinned]))

        if (remainingTabs.length > 0) {
            openTab(remainingTabs[remainingTabs.length - 1])
        } else {
            persistActiveTab('')
            router.replace(ROUTES.HOME)
        }
    }

    return {
        tabs: Array.from(new Set([...openTabs, ...pinned])),
        activeTabId,
        pendingUnlockId,
        tabBarActions,
        setTabBarActions,
        templateTitles,
        setTemplateTitle,
        registerTab,
        openTab,
        setActiveTab: openTab,
        closeTab,
        confirmUnlock,
        cancelUnlock
    }
}
