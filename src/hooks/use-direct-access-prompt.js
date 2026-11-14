import { useCallback, useState } from 'react'

import { useNotes } from './use-notes'
import { useOnForeground } from './use-on-foreground'
import { useStorage } from './use-storage'
import { useStorageEffect } from './use-storage-effect'
import { hasDirectAccess, requestDirectAccess, shouldPromptDirectAccess } from '@/utils/direct-access'

import { DIRECT_ACCESS_MIN_NOTES } from '@/constants/direct-access'
import { STORAGE_BOOLEAN } from '@/constants/storage-values'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export function useDirectAccessPrompt() {
    const { setItem } = useStorage()
    const { notes } = useNotes()

    const [granted, setGranted] = useState(hasDirectAccess)
    const [dismissed, setDismissed] = useState(true)

    useStorageEffect(STORAGE_KEYS.DIRECT_ACCESS_DISMISSED, (value) => {
        setDismissed(value === STORAGE_BOOLEAN.TRUE)
    })

    useOnForeground(() => setGranted(hasDirectAccess()))

    const onDismiss = useCallback(() => {
        setDismissed(true)
        setItem(STORAGE_KEYS.DIRECT_ACCESS_DISMISSED, STORAGE_BOOLEAN.TRUE)
    }, [setItem])

    return {
        visible: shouldPromptDirectAccess({
            granted,
            dismissed,
            noteCount: notes.length,
            minNotes: DIRECT_ACCESS_MIN_NOTES
        }),
        onRequest: requestDirectAccess,
        onDismiss
    }
}
