import { useRef } from 'react'

export function useNavigationReadiness({
    loading,
    reconciled,
    activeRepository,
    notesLoading
}) {
    const repositorySettled = !loading && reconciled
    const isReady = repositorySettled && !!activeRepository && !notesLoading
    const needsGate = repositorySettled && !activeRepository

    const hasNeededGate = useRef(false)
    if (needsGate) hasNeededGate.current = true

    const hasBeenReady = useRef(false)
    if (isReady) hasBeenReady.current = true

    const showDrawer = !needsGate && hasBeenReady.current
    const hasResolvedOnce = isReady || needsGate || hasNeededGate.current || hasBeenReady.current

    return {
        isReady,
        needsGate,
        showDrawer,
        shouldRenderNothing: !repositorySettled || !hasResolvedOnce
    }
}
