import { useEffect } from 'react'
import { useTabs } from './use-tabs'

export function useTabBarActions({ onOpenDrawer, menu }, deps = []) {
    const { setTabBarActions } = useTabs()

    useEffect(() => {
        setTabBarActions({ onOpenDrawer, menu })
        return () => setTabBarActions(null)
    }, deps)
}
