import { useDeferredReady } from './use-deferred-ready'

export function useDrawerMounted(drawerOpen) {
    const ready = useDeferredReady()

    return ready || drawerOpen
}
