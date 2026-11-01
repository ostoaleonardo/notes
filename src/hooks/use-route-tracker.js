import { useEffect } from 'react'
import { useGlobalSearchParams, usePathname } from 'expo-router'

import { setCurrentRoute } from '@/utils/navigation'

export function useRouteTracker() {
    const pathname = usePathname()
    const params = useGlobalSearchParams()
    const paramsKey = JSON.stringify(params)

    useEffect(() => {
        setCurrentRoute(pathname, JSON.parse(paramsKey))
    }, [pathname, paramsKey])
}
