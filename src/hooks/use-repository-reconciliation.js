import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useRepositories } from './use-repositories'

export function useRepositoryReconciliation() {
    const { loading, repositories, reconcileRepositories, setReconciled } = useRepositories()

    useEffect(() => {
        if (loading) return
        reconcileRepositories().finally(() => setReconciled(true))
    }, [loading])

    useEffect(() => {
        if (loading) return

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') reconcileRepositories()
        })

        return () => subscription.remove()
    }, [loading, repositories])
}
