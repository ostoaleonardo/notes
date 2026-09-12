import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'

import { useRepositories } from './use-repositories'

export function useRepositoryReconciliation() {
    const { loading, reconcileRepositories, setReconciled } = useRepositories()

    const reconcileRef = useRef(reconcileRepositories)
    reconcileRef.current = reconcileRepositories

    useEffect(() => {
        if (loading) return
        reconcileRepositories().finally(() => setReconciled(true))
    }, [loading])

    useEffect(() => {
        if (loading) return

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') reconcileRef.current()
        })

        return () => subscription.remove()
    }, [loading])
}
