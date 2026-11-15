import { useCallback, useSyncExternalStore } from 'react'

import { getCurrentNoteId, subscribeCurrentNoteId } from '@/utils/current-note-store'

export function useIsCurrentNote(path) {
    const getSnapshot = useCallback(() => getCurrentNoteId() === path, [path])

    return useSyncExternalStore(subscribeCurrentNoteId, getSnapshot)
}
