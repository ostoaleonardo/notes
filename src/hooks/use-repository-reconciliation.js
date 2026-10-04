import { useEffect, useRef } from 'react'

import { useOnForeground } from './use-on-foreground'
import { useRepositories } from './use-repositories'

export function useRepositoryReconciliation() {
    const { loading, reconcileRepositories, setReconciled } = useRepositories()

    const reconcileRef = useRef(reconcileRepositories)
    reconcileRef.current = reconcileRepositories

    useEffect(() => {
        if (loading) return
        reconcileRef.current().finally(() => setReconciled(true))
    }, [loading, setReconciled])

    useOnForeground(() => {
        if (!loading) reconcileRef.current()
    })
}
