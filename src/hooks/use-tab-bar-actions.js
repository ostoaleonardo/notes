import { useEffect } from 'react'
import { useTabs } from './use-tabs'

// Lets the active note screen render its own drawer-open handler and menu inside the
// global TabBar, at tab height, since the TabBar itself sits outside the drawer navigator.
export function useTabBarActions({ onOpenDrawer, menu }, deps = []) {
    const { setTabBarActions } = useTabs()

    useEffect(() => {
        setTabBarActions({ onOpenDrawer, menu })
        return () => setTabBarActions(null)
    }, deps)
}
