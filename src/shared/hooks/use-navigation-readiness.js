import { useRef } from 'react'

export function useNavigationReadiness({
    loading,
    activeFolder,
    notesLoading
}) {
    const isReady = !loading && !!activeFolder && !notesLoading
    const needsGate = !loading && !activeFolder

    const hasNeededGate = useRef(false)
    const hasBeenReady = useRef(false)
    if (needsGate) {
        hasNeededGate.current = true
        hasBeenReady.current = false
    }

    if (isReady) hasBeenReady.current = true

    const showDrawer = !needsGate && hasBeenReady.current
    const hasResolvedOnce = isReady || needsGate || hasNeededGate.current || hasBeenReady.current

    return {
        isReady,
        needsGate,
        showDrawer,
        shouldRenderNothing: loading || !hasResolvedOnce
    }
}
