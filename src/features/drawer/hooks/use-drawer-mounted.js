import { useDeferredReady } from '../../../shared/hooks/use-deferred-ready'

export function useDrawerMounted(drawerOpen) {
    const ready = useDeferredReady()

    return ready || drawerOpen
}
