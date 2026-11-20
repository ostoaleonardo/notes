import { useEffect, useRef } from 'react'

import { useOnForeground } from './use-on-foreground'
import { useFolders } from './use-folders'

export function useFolderReconciliation() {
    const { loading, reconcileFolders } = useFolders()

    const reconcileRef = useRef(reconcileFolders)
    reconcileRef.current = reconcileFolders

    useEffect(() => {
        if (loading) return
        reconcileRef.current()
    }, [loading])

    useOnForeground(() => {
        if (!loading) reconcileRef.current()
    })
}
