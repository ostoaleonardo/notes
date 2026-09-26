import { useEffect, useRef } from 'react'

import { useOnForeground } from './use-on-foreground'
import { useRepositories } from './use-repositories'

export function useRepositoryReconciliation() {
    const { loading, reconcileRepositories, setReconciled } = useRepositories()

    const reconcileRef = useRef(reconcileRepositories)
    reconcileRef.current = reconcileRepositories

    useEffect(() => {
        if (loading) return
        reconcileRepositories().finally(() => setReconciled(true))
    }, [loading])

    useOnForeground(() => {
        if (!loading) reconcileRef.current()
    })
}
